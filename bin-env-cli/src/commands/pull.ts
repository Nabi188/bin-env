import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import { createApiClient, Project, EnvFile } from "../services/api";
import { authService } from "../services/auth";

export async function pullCommand(): Promise<void> {
  console.log(chalk.blue("📥 Pull environment files"));
  console.log();

  try {
    // Check authentication
    if (!authService.isAuthenticated()) {
      console.log(chalk.red("❌ Not authenticated. Please login first."));
      console.log(chalk.gray("Run: bin-env login"));
      process.exit(1);
    }

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
        message: "Select a project:",
        choices: projectChoices,
      },
    ]);

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

    if (envFiles.length === 0) {
      console.log(
        chalk.yellow("⚠️  No environment files found in this project")
      );
      return;
    }

    // Env file selection
    const envFileChoices = envFiles.map((envFile) => ({
      name: envFile.name,
      value: envFile.id,
      short: envFile.name,
    }));

    const { selectedEnvFileId } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedEnvFileId",
        message: "Select an environment file:",
        choices: envFileChoices,
      },
    ]);

    // Find the selected env file
    const selectedEnvFile = envFiles.find(
      (file) => file.id === selectedEnvFileId
    );
    if (!selectedEnvFile) {
      console.log(chalk.red("❌ Selected environment file not found"));
      process.exit(1);
    }

    // Ask for action (download or copy)
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          {
            name: "📁 Download to .env file",
            value: "download",
            short: "Download",
          },
          {
            name: "📋 Copy to terminal",
            value: "copy",
            short: "Copy",
          },
        ],
      },
    ]);

    // Execute the chosen action
    if (action === "download") {
      await downloadEnvFile(selectedEnvFile);
    } else {
      copyToTerminal(selectedEnvFile);
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

async function downloadEnvFile(envFile: EnvFile): Promise<void> {
  try {
    const envFilePath = path.join(process.cwd(), ".env");

    // Check if .env file already exists
    if (fs.existsSync(envFilePath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: ".env file already exists. Overwrite?",
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow("⚠️  Download cancelled"));
        return;
      }
    }

    // Write the file
    fs.writeFileSync(envFilePath, envFile.rawContent, "utf8");

    console.log(chalk.green("✅ Environment file downloaded successfully!"));
    console.log(chalk.gray(`File: ${envFilePath}`));
    console.log(chalk.gray(`Size: ${envFile.rawContent.length} characters`));
  } catch (error: any) {
    console.log(chalk.red("❌ Failed to download environment file"));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

function copyToTerminal(envFile: EnvFile): void {
  console.log();
  console.log(chalk.blue("📋 Environment file content:"));
  console.log(chalk.gray("─".repeat(50)));
  console.log(envFile.rawContent);
  console.log(chalk.gray("─".repeat(50)));
  console.log(chalk.green("✅ Content displayed above"));
}
