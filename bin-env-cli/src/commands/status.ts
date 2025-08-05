import chalk from "chalk";
import { authService } from "../services/auth";

export async function statusCommand(): Promise<void> {
  console.log(chalk.blue("📊 bin-env Status"));
  console.log();

  try {
    const auth = authService.getAuth();

    if (!auth || !auth.token || !auth.baseUrl) {
      console.log(chalk.yellow("❌ Not logged in"));
      console.log(chalk.gray("Run 'bin-env login' to authenticate"));
      return;
    }

    console.log(chalk.green("✅ Logged in"));
    console.log(chalk.gray(`Base URL: ${auth.baseUrl}`));

    // Optional: Show login timestamp
    if (auth.timestamp) {
      const loginDate = new Date(auth.timestamp);
      console.log(chalk.gray(`Logged in at: ${loginDate.toLocaleString()}`));
    }
  } catch (error: any) {
    console.log(chalk.red("❌ Error checking status"));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}
