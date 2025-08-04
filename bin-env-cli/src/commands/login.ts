import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { ApiClient } from "../services/api";
import { authService } from "../services/auth";

export async function loginCommand(): Promise<void> {
  console.log(chalk.blue("🔐 Login to bin-env"));
  console.log();

  try {
    // Prompt for base URL and password
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "baseUrl",
        message: "Enter base URL:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Base URL is required";
          }
          // Basic URL validation
          try {
            new URL(input);
            return true;
          } catch {
            return "Please enter a valid URL";
          }
        },
      },
      {
        type: "password",
        name: "password",
        message: "Enter password:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Password is required";
          }
          return true;
        },
      },
    ]);

    const { baseUrl, password } = answers;

    // Show loading spinner
    const spinner = ora("Authenticating...").start();

    try {
      // Create API client and attempt login
      const apiClient = new ApiClient(baseUrl);
      const loginResponse = await apiClient.login(password);

      // Save authentication data
      authService.saveAuth(baseUrl, loginResponse.token);

      spinner.succeed(chalk.green("✅ Login successful!"));
      console.log(chalk.gray(`Authenticated with: ${baseUrl}`));
    } catch (error: any) {
      spinner.fail(chalk.red("❌ Login failed"));
      console.log(chalk.red(error.message));
      process.exit(1);
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
