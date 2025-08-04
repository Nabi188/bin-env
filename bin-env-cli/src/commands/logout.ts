import chalk from "chalk";
import { authService } from "../services/auth";

export async function logoutCommand(): Promise<void> {
  console.log(chalk.blue("🚪 Logout from bin-env"));
  console.log();

  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      console.log(chalk.yellow("⚠️  You are not currently logged in"));
      return;
    }

    // Clear authentication data
    authService.clearAuth();

    console.log(chalk.green("✅ Logout successful!"));
    console.log(chalk.gray("Authentication data cleared"));
  } catch (error: any) {
    console.log(chalk.red("❌ Logout failed"));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}
