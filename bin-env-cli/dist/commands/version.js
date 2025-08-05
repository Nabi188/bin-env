"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionCommand = versionCommand;
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = require("path");
async function versionCommand() {
    try {
        // Read current version from package.json
        const packageJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../../package.json"), "utf8"));
        const currentVersion = packageJson.version;
        const packageName = packageJson.name;
        console.log(chalk_1.default.blue("📦 bin-env Version Information"));
        console.log();
        console.log(chalk_1.default.green(`Current version: ${currentVersion}`));
        // Check latest version from npm
        try {
            console.log(chalk_1.default.gray("Checking for updates..."));
            const response = await axios_1.default.get(`https://registry.npmjs.org/${packageName}/latest`, {
                timeout: 5000,
            });
            const latestVersion = response.data.version;
            if (latestVersion === currentVersion) {
                console.log(chalk_1.default.green("✅ You are using the latest version!"));
            }
            else {
                console.log(chalk_1.default.yellow(`📢 Latest version: ${latestVersion}`));
                console.log();
                console.log(chalk_1.default.cyan("To update, run:"));
                console.log(chalk_1.default.white(`  npm install -g ${packageName}@latest`));
                console.log(chalk_1.default.gray("or"));
                console.log(chalk_1.default.white(`  bin-env update`));
            }
        }
        catch (error) {
            console.log(chalk_1.default.gray("Could not check for updates (network error)"));
        }
    }
    catch (error) {
        console.log(chalk_1.default.red("❌ Error getting version information"));
        console.log(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
//# sourceMappingURL=version.js.map