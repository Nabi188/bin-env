import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import { createApiClient, Project, EnvFile } from "../services/api";
import { authService } from "../services/auth";

export async function pushCommand(): Promise<void> {
  console.log(chalk.blue("📤 Push environment file"));
  console.log();

  try {
    // Check authentication
    if (!authService.isAuthenticated()) {
      console.log(chalk.red("❌ Not authenticated. Please login first."));
      console.log(chalk.gray("Run: bin-env login"));
      process.exit(1);
    }

    // Check for .env file
    const envFilePath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envFilePath)) {
      console.log(chalk.red("❌ No .env file found in current directory"));
      console.log(chalk.gray("Make sure you have a .env file to push"));
      process.exit(1);
    }

    // Read .env file content
    let envContent: string;
    try {
      envContent = fs.readFileSync(envFilePath, "utf8");
    } catch (error: any) {
      console.log(chalk.red("❌ Failed to read .env file"));
      console.log(chalk.red(error.message));
      process.exit(1);
    }

    if (!envContent.trim()) {
      console.log(chalk.red("❌ .env file is empty"));
      process.exit(1);
    }

    console.log(
      chalk.green(`✅ Found .env file (${envContent.length} characters)`)
    );
    console.log();

    // Create API client
    const apiClient = createApiClient();

    // Fetch projects
    const projectsSpinner = ora("Fetching projects...").start();
    let projects: Project[];

    try {
      projects = await apiClient.getProjects();
      projectsSpinner.succeed(chalk.green("✅ Projects loaded"));
    } catch (error: any) {
      projectsSpinner.fail(chalk.red("❌ Failed to fetch projects"));
      console.log(chalk.red(error.message));
      process.exit(1);
    }

    if (projects.length === 0) {
      console.log(chalk.yellow("⚠️  No projects found"));
      console.log(chalk.gray("Create a project first using the web interface"));
      return;
    }

    // Project selection
    const projectChoices = projects.map((project) => ({
      name: `${project.name} - ${project.description}`,
      value: project.id,
      short: project.name,
    }));

    const { selectedProjectId } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedProjectId",
        message: "📁 Select a project:",
        choices: projectChoices,
      },
    ]);

    const selectedProject = projects.find((p) => p.id === selectedProjectId);

    // Fetch env files for selected project
    const envFilesSpinner = ora("Fetching environment files...").start();
    let envFiles: EnvFile[];

    try {
      envFiles = await apiClient.getEnvFiles(selectedProjectId);
      envFilesSpinner.succeed(chalk.green("✅ Environment files loaded"));
    } catch (error: any) {
      envFilesSpinner.fail(chalk.red("❌ Failed to fetch environment files"));
      console.log(chalk.red(error.message));
      process.exit(1);
    }

    // Show existing env files and ask for action
    console.log();
    if (envFiles.length > 0) {
      console.log(
        chalk.blue(`📋 Environment files in "${selectedProject?.name}":`)
      );
      envFiles.forEach((file) => {
        console.log(chalk.gray(`  - ${file.name}`));
      });
      console.log();
    }

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "❓ What would you like to do?",
        choices: [
          {
            name: "📝 Create new env file",
            value: "create",
            short: "Create new",
          },
          ...(envFiles.length > 0
            ? [
                {
                  name: "🔄 Update existing env file",
                  value: "update",
                  short: "Update existing",
                },
              ]
            : []),
        ],
      },
    ]);

    if (action === "create") {
      await createNewEnvFile(
        apiClient,
        selectedProjectId,
        selectedProject?.name || "",
        envContent,
        envFiles
      );
    } else {
      await updateExistingEnvFile(
        apiClient,
        selectedProjectId,
        selectedProject?.name || "",
        envContent,
        envFiles
      );
    }
  } catch (error: any) {
    if (error.isTtyError) {
      console.log(
        chalk.red("❌ Prompt couldn't be rendered in the current environment")
      );
    } else {
      console.log(chalk.red("❌ An unexpected error occurred"));
      console.log(chalk.red(error.message));
    }
    process.exit(1);
  }
}

async function createNewEnvFile(
  apiClient: any,
  projectId: string,
  projectName: string,
  envContent: string,
  existingFiles: EnvFile[]
): Promise<void> {
  const { envFileName } = await inquirer.prompt([
    {
      type: "input",
      name: "envFileName",
      message: "📝 Enter name for new env file:",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Environment file name is required";
        }
        if (
          existingFiles.some(
            (file) => file.name.toLowerCase() === input.trim().toLowerCase()
          )
        ) {
          return "Environment file with this name already exists";
        }
        return true;
      },
    },
  ]);

  // Show preview and confirm
  const lines = envContent.split("\n").filter((line) => line.trim()).length;
  console.log();
  console.log(chalk.blue("📋 Preview:"));
  console.log(chalk.gray(`Project: ${projectName}`));
  console.log(chalk.gray(`Env File: ${envFileName.trim()} (new)`));
  console.log(
    chalk.gray(`Content: ${lines} lines, ${envContent.length} characters`)
  );
  console.log();

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Continue?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("⚠️  Push cancelled"));
    return;
  }

  // Create the env file
  const spinner = ora("Uploading environment file...").start();

  try {
    await apiClient.createEnvFile(projectId, envFileName.trim(), envContent);
    spinner.succeed(chalk.green("✅ Environment file uploaded successfully!"));
    console.log(chalk.gray(`Project: ${projectName}`));
    console.log(chalk.gray(`Env File: ${envFileName.trim()}`));
  } catch (error: any) {
    spinner.fail(chalk.red("❌ Failed to upload environment file"));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

async function updateExistingEnvFile(
  apiClient: any,
  projectId: string,
  projectName: string,
  envContent: string,
  envFiles: EnvFile[]
): Promise<void> {
  const envFileChoices = envFiles.map((envFile) => ({
    name: envFile.name,
    value: envFile.id,
    short: envFile.name,
  }));

  const { selectedEnvFileId } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedEnvFileId",
      message: "🔄 Select env file to update:",
      choices: envFileChoices,
    },
  ]);

  const selectedEnvFile = envFiles.find(
    (file) => file.id === selectedEnvFileId
  );
  if (!selectedEnvFile) {
    console.log(chalk.red("❌ Selected environment file not found"));
    process.exit(1);
  }

  // Show preview and confirm
  const lines = envContent.split("\n").filter((line) => line.trim()).length;
  console.log();
  console.log(chalk.blue("📋 Preview:"));
  console.log(chalk.gray(`Project: ${projectName}`));
  console.log(chalk.gray(`Env File: ${selectedEnvFile.name} (update)`));
  console.log(
    chalk.gray(`Content: ${lines} lines, ${envContent.length} characters`)
  );
  console.log();

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "This will overwrite the existing env file. Continue?",
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("⚠️  Push cancelled"));
    return;
  }

  // Update the env file
  const spinner = ora("Updating environment file...").start();

  try {
    await apiClient.updateEnvFile(projectId, selectedEnvFileId, envContent);
    spinner.succeed(chalk.green("✅ Environment file updated successfully!"));
    console.log(chalk.gray(`Project: ${projectName}`));
    console.log(chalk.gray(`Env File: ${selectedEnvFile.name}`));
  } catch (error: any) {
    spinner.fail(chalk.red("❌ Failed to update environment file"));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}
