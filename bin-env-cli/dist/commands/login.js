"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCommand = loginCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const api_1 = require("../services/api");
const auth_1 = require("../services/auth");
async function loginCommand() {
    console.log(chalk_1.default.blue("🔐 Login to bin-env"));
    console.log();
    try {
        // Prompt for base URL and password
        const answers = await inquirer_1.default.prompt([
            {
                type: "input",
                name: "baseUrl",
                message: "Enter base URL:",
                validate: (input) => {
                    if (!input.trim()) {
                        return "Base URL is required";
                    }
                    // Basic URL validation
                    try {
                        new URL(input);
                        return true;
                    }
                    catch {
                        return "Please enter a valid URL";
                    }
                },
            },
            {
                type: "password",
                name: "password",
                message: "Enter password:",
                validate: (input) => {
                    if (!input.trim()) {
                        return "Password is required";
                    }
                    return true;
                },
            },
        ]);
        const { baseUrl, password } = answers;
        // Show loading spinner
        const spinner = (0, ora_1.default)("Authenticating...").start();
        try {
            // Create API client and attempt login
            const apiClient = new api_1.ApiClient(baseUrl);
            const loginResponse = await apiClient.login(password);
            // Save authentication data
            auth_1.authService.saveAuth(baseUrl, loginResponse.token);
            spinner.succeed(chalk_1.default.green("✅ Login successful!"));
            console.log(chalk_1.default.gray(`Authenticated with: ${baseUrl}`));
        }
        catch (error) {
            spinner.fail(chalk_1.default.red("❌ Login failed"));
            console.log(chalk_1.default.red(error.message));
            process.exit(1);
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
//# sourceMappingURL=login.js.map