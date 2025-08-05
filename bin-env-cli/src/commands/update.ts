import chalk from "chalk";
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import axios from "axios";

export async function updateCommand(): Promise<void> {
  console.log(chalk.blue("🔄 Updating bin-env\n"));

  const pkgPath = join(__dirname, "../../package.json");
  const { name: packageName, version: currentVersion } = JSON.parse(
    readFileSync(pkgPath, "utf8")
  );

  console.log(chalk.gray(`Current version: ${currentVersion}`));
  console.log(chalk.gray("Checking for updates..."));

  try {
    const { data } = await axios.get(
      `https://registry.npmjs.org/${packageName}/latest`,
      { timeout: 10000 }
    );

    const latestVersion = data.version;

    if (latestVersion === currentVersion) {
      console.log(chalk.green("✅ You are already using the latest version!"));
      return;
    }

    console.log(chalk.yellow(`📢 New version available: ${latestVersion}`));
    console.log(chalk.gray("Installing update...\n"));

    const npmProcess = spawn(
      "npm",
      ["install", "-g", `${packageName}@latest`],
      {
        stdio: "inherit",
      }
    );

    npmProcess.on("close", (code) => {
      console.log();
      if (code === 0) {
        console.log(chalk.green("✅ Update completed successfully!"));
        console.log(
          chalk.gray(`Updated from ${currentVersion} to ${latestVersion}`)
        );
      } else {
        showManualUpdateMessage(packageName, "❌ Update failed");
        process.exit(1);
      }
    });

    npmProcess.on("error", (err) => {
      showManualUpdateMessage(packageName, `❌ ${err.message}`);
      process.exit(1);
    });
  } catch (err: any) {
    showManualUpdateMessage(packageName, `❌ ${err.message}`);
    process.exit(1);
  }
}

function showManualUpdateMessage(packageName: string, errorMsg: string) {
  console.log(chalk.red(errorMsg));
  console.log(chalk.gray("You can try updating manually:"));
  console.log(chalk.white(`  npm install -g ${packageName}@latest`));
}
