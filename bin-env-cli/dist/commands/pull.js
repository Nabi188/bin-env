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
exports.pullCommand = pullCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const api_1 = require("../services/api");
const auth_1 = require("../services/auth");
async function pullCommand() {
    console.log(chalk_1.default.blue("📥 Pull environment files"));
    console.log();
    try {
        // Check authentication
        if (!auth_1.authService.isAuthenticated()) {
            console.log(chalk_1.default.red("❌ Not authenticated. Please login first."));
            console.log(chalk_1.default.gray("Run: bin-env login"));
            process.exit(1);
        }
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
                message: "Select a project:",
                choices: projectChoices,
            },
        ]);
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
        if (envFiles.length === 0) {
            console.log(chalk_1.default.yellow("⚠️  No environment files found in this project"));
            return;
        }
        // Env file selection
        const envFileChoices = envFiles.map((envFile) => ({
            name: envFile.name,
            value: envFile.id,
            short: envFile.name,
        }));
        const { selectedEnvFileId } = await inquirer_1.default.prompt([
            {
                type: "list",
                name: "selectedEnvFileId",
                message: "Select an environment file:",
                choices: envFileChoices,
            },
        ]);
        // Find the selected env file
        const selectedEnvFile = envFiles.find((file) => file.id === selectedEnvFileId);
        if (!selectedEnvFile) {
            console.log(chalk_1.default.red("❌ Selected environment file not found"));
            process.exit(1);
        }
        // Ask for action (download or copy)
        const { action } = await inquirer_1.default.prompt([
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
        }
        else {
            copyToTerminal(selectedEnvFile);
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
async function downloadEnvFile(envFile) {
    try {
        const envFilePath = path.join(process.cwd(), ".env");
        // Check if .env file already exists
        if (fs.existsSync(envFilePath)) {
            const { overwrite } = await inquirer_1.default.prompt([
                {
                    type: "confirm",
                    name: "overwrite",
                    message: ".env file already exists. Overwrite?",
                    default: false,
                },
            ]);
            if (!overwrite) {
                console.log(chalk_1.default.yellow("⚠️  Download cancelled"));
                return;
            }
        }
        // Write the file
        fs.writeFileSync(envFilePath, envFile.rawContent, "utf8");
        console.log(chalk_1.default.green("✅ Environment file downloaded successfully!"));
        console.log(chalk_1.default.gray(`File: ${envFilePath}`));
        console.log(chalk_1.default.gray(`Size: ${envFile.rawContent.length} characters`));
    }
    catch (error) {
        console.log(chalk_1.default.red("❌ Failed to download environment file"));
        console.log(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
function copyToTerminal(envFile) {
    console.log();
    console.log(chalk_1.default.blue("📋 Environment file content:"));
    console.log(chalk_1.default.gray("─".repeat(50)));
    console.log(envFile.rawContent);
    console.log(chalk_1.default.gray("─".repeat(50)));
    console.log(chalk_1.default.green("✅ Content displayed above"));
}
//# sourceMappingURL=pull.js.map