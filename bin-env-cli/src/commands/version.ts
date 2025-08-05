import chalk from "chalk";
import axios from "axios";
import { readFileSync } from "fs";
import { join } from "path";

export async function versionCommand(): Promise<void> {
  try {
    // Read current version from package.json
    const packageJson = JSON.parse(
      readFileSync(join(__dirname, "../../package.json"), "utf8")
    );
    const currentVersion = packageJson.version;
    const packageName = packageJson.name;

    console.log(chalk.blue("📦 bin-env Version Information"));
    console.log();
    console.log(chalk.green(`Current version: ${currentVersion}`));

    // Check latest version from npm
    try {
      console.log(chalk.gray("Checking for updates..."));

      const response = await axios.get(
        `https://registry.npmjs.org/${packageName}/latest`,
        {
          timeout: 5000,
        }
      );

      const latestVersion = response.data.version;

      if (latestVersion === currentVersion) {
        console.log(chalk.green("✅ You are using the latest version!"));
      } else {
        console.log(chalk.yellow(`📢 Latest version: ${latestVersion}`));
        console.log();
        console.log(chalk.cyan("To update, run:"));
        console.log(chalk.white(`  npm install -g ${packageName}@latest`));
        console.log(chalk.gray("or"));
        console.log(chalk.white(`  bin-env update`));
      }
    } catch (error) {
      console.log(chalk.gray("Could not check for updates (network error)"));
    }
  } catch (error: any) {
    console.log(chalk.red("❌ Error getting version information"));
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}
