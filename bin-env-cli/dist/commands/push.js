"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushCommand = pushCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const api_1 = require("../services/api");
const auth_1 = require("../services/auth");
async function pushCommand() {
    console.log(chalk_1.default.blue("📤 Push environment file"));
    console.log();
    try {
        // Check authentication
        if (!auth_1.authService.isAuthenticated()) {
            console.log(chalk_1.default.red("❌ Not authenticated. Please login first."));
            console.log(chalk_1.default.gray("Run: bin-env login"));
            process.exit(1);
        }
        // Check for .env file
        const envFilePath = path.join(process.cwd(), ".env");
        if (!fs.existsSync(envFilePath)) {
            console.log(chalk_1.default.red("❌ No .env file found in current directory"));
            console.log(chalk_1.default.gray("Make sure you have a .env file to push"));
            process.exit(1);
        }
        // Read .env file content
        let envContent;
        try {
            envContent = fs.readFileSync(envFilePath, "utf8");
        }
        catch (error) {
            console.log(chalk_1.default.red("❌ Failed to read .env file"));
            console.log(chalk_1.default.red(error.message));
            process.exit(1);
        }
        if (!envContent.trim()) {
            console.log(chalk_1.default.red("❌ .env file is empty"));
            process.exit(1);
        }
        console.log(chalk_1.default.green(`✅ Found .env file (${envContent.length} characters)`));
        console.log();
        // Create API client
        const apiClient = (0, api_1.createApiClient)();
        // Fetch projects
        const projectsSpinner = (0, ora_1.default)("Fetching projects...").start();
        let projects;
        try {
            projects = await apiClient.getProjects();
            projectsSpinner.succeed(chalk_1.default.green("✅ Projects loaded"));
        }
        catch (error) {
            projectsSpinner.fail(chalk_1.default.red("❌ Failed to fetch projects"));
            console.log(chalk_1.default.red(error.message));
            process.exit(1);
        }
        if (projects.length === 0) {
            console.log(chalk_1.default.yellow("⚠️  No projects found"));
            console.log(chalk_1.default.gray("Create a project first using the web interface"));
            return;
        }
        // Project selection
        const projectChoices = projects.map((project) => ({
            name: `${project.name} - ${project.description}`,
            value: project.id,
            short: project.name,
        }));
        const { selectedProjectId } = await inquirer_1.default.prompt([
            {
                type: "list",
                name: "selectedProjectId",
                message: "📁 Select a project:",
                choices: projectChoices,
            },
        ]);
        const selectedProject = projects.find((p) => p.id === selectedProjectId);
        // Fetch env files for selected project
        const envFilesSpinner = (0, ora_1.default)("Fetching environment files...").start();
        let envFiles;
        try {
            envFiles = await apiClient.getEnvFiles(selectedProjectId);
            envFilesSpinner.succeed(chalk_1.default.green("✅ Environment files loaded"));
        }
        catch (error) {
            envFilesSpinner.fail(chalk_1.default.red("❌ Failed to fetch environment files"));
            console.log(chalk_1.default.red(error.message));
            process.exit(1);
        }
        // Show existing env files and ask for action
        console.log();
        if (envFiles.length > 0) {
            console.log(chalk_1.default.blue(`📋 Environment files in "${selectedProject?.name}":`));
            envFiles.forEach((file) => {
                console.log(chalk_1.default.gray(`  - ${file.name}`));
            });
            console.log();
        }
        const { action } = await inquirer_1.default.prompt([
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
            await createNewEnvFile(apiClient, selectedProjectId, selectedProject?.name || "", envContent, envFiles);
        }
        else {
            await updateExistingEnvFile(apiClient, selectedProjectId, selectedProject?.name || "", envContent, envFiles);
        }
    }
    catch (error) {
        if (error.isTtyError) {
            console.log(chalk_1.default.red("❌ Prompt couldn't be rendered in the current environment"));
        }
        else {
            console.log(chalk_1.default.red("❌ An unexpected error occurred"));
            console.log(chalk_1.default.red(error.message));
        }
        process.exit(1);
    }
}
async function createNewEnvFile(apiClient, projectId, projectName, envContent, existingFiles) {
    const { envFileName } = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "envFileName",
            message: "📝 Enter name for new env file:",
            validate: (input) => {
                if (!input.trim()) {
                    return "Environment file name is required";
                }
                if (existingFiles.some((file) => file.name.toLowerCase() === input.trim().toLowerCase())) {
                    return "Environment file with this name already exists";
                }
                return true;
            },
        },
    ]);
    // Show preview and confirm
    const lines = envContent.split("\n").filter((line) => line.trim()).length;
    console.log();
    console.log(chalk_1.default.blue("📋 Preview:"));
    console.log(chalk_1.default.gray(`Project: ${projectName}`));
    console.log(chalk_1.default.gray(`Env File: ${envFileName.trim()} (new)`));
    console.log(chalk_1.default.gray(`Content: ${lines} lines, ${envContent.length} characters`));
    console.log();
    const { confirm } = await inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Continue?",
            default: true,
        },
    ]);
    if (!confirm) {
        console.log(chalk_1.default.yellow("⚠️  Push cancelled"));
        return;
    }
    // Create the env file
    const spinner = (0, ora_1.default)("Uploading environment file...").start();
    try {
        await apiClient.createEnvFile(projectId, envFileName.trim(), envContent);
        spinner.succeed(chalk_1.default.green("✅ Environment file uploaded successfully!"));
        console.log(chalk_1.default.gray(`Project: ${projectName}`));
        console.log(chalk_1.default.gray(`Env File: ${envFileName.trim()}`));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red("❌ Failed to upload environment file"));
        console.log(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
async function updateExistingEnvFile(apiClient, projectId, projectName, envContent, envFiles) {
    const envFileChoices = envFiles.map((envFile) => ({
        name: envFile.name,
        value: envFile.id,
        short: envFile.name,
    }));
    const { selectedEnvFileId } = await inquirer_1.default.prompt([
        {
            type: "list",
            name: "selectedEnvFileId",
            message: "🔄 Select env file to update:",
            choices: envFileChoices,
        },
    ]);
    const selectedEnvFile = envFiles.find((file) => file.id === selectedEnvFileId);
    if (!selectedEnvFile) {
        console.log(chalk_1.default.red("❌ Selected environment file not found"));
        process.exit(1);
    }
    // Show preview and confirm
    const lines = envContent.split("\n").filter((line) => line.trim()).length;
    console.log();
    console.log(chalk_1.default.blue("📋 Preview:"));
    console.log(chalk_1.default.gray(`Project: ${projectName}`));
    console.log(chalk_1.default.gray(`Env File: ${selectedEnvFile.name} (update)`));
    console.log(chalk_1.default.gray(`Content: ${lines} lines, ${envContent.length} characters`));
    console.log();
    const { confirm } = await inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "This will overwrite the existing env file. Continue?",
            default: false,
        },
    ]);
    if (!confirm) {
        console.log(chalk_1.default.yellow("⚠️  Push cancelled"));
        return;
    }
    // Update the env file
    const spinner = (0, ora_1.default)("Updating environment file...").start();
    try {
        await apiClient.updateEnvFile(projectId, selectedEnvFileId, envContent);
        spinner.succeed(chalk_1.default.green("✅ Environment file updated successfully!"));
        console.log(chalk_1.default.gray(`Project: ${projectName}`));
        console.log(chalk_1.default.gray(`Env File: ${selectedEnvFile.name}`));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red("❌ Failed to update environment file"));
        console.log(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
//# sourceMappingURL=push.js.map