"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommand = updateCommand;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
async function updateCommand() {
    console.log(chalk_1.default.blue("🔄 Updating bin-env\n"));
    const pkgPath = (0, path_1.join)(__dirname, "../../package.json");
    const { name: packageName, version: currentVersion } = JSON.parse((0, fs_1.readFileSync)(pkgPath, "utf8"));
    console.log(chalk_1.default.gray(`Current version: ${currentVersion}`));
    console.log(chalk_1.default.gray("Checking for updates..."));
    try {
        const { data } = await axios_1.default.get(`https://registry.npmjs.org/${packageName}/latest`, { timeout: 10000 });
        const latestVersion = data.version;
        if (latestVersion === currentVersion) {
            console.log(chalk_1.default.green("✅ You are already using the latest version!"));
            return;
        }
        console.log(chalk_1.default.yellow(`📢 New version available: ${latestVersion}`));
        console.log(chalk_1.default.gray("Installing update...\n"));
        const npmProcess = (0, child_process_1.spawn)("npm", ["install", "-g", `${packageName}@latest`], {
            stdio: "inherit",
        });
        npmProcess.on("close", (code) => {
            console.log();
            if (code === 0) {
                console.log(chalk_1.default.green("✅ Update completed successfully!"));
                console.log(chalk_1.default.gray(`Updated from ${currentVersion} to ${latestVersion}`));
            }
            else {
                showManualUpdateMessage(packageName, "❌ Update failed");
                process.exit(1);
            }
        });
        npmProcess.on("error", (err) => {
            showManualUpdateMessage(packageName, `❌ ${err.message}`);
            process.exit(1);
        });
    }
    catch (err) {
        showManualUpdateMessage(packageName, `❌ ${err.message}`);
        process.exit(1);
    }
}
function showManualUpdateMessage(packageName, errorMsg) {
    console.log(chalk_1.default.red(errorMsg));
    console.log(chalk_1.default.gray("You can try updating manually:"));
    console.log(chalk_1.default.white(`  npm install -g ${packageName}@latest`));
}
//# sourceMappingURL=update.js.map