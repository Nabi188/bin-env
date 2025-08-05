"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = statusCommand;
const chalk_1 = __importDefault(require("chalk"));
const auth_1 = require("../services/auth");
async function statusCommand() {
    console.log(chalk_1.default.blue("📊 bin-env Status"));
    console.log();
    try {
        const auth = auth_1.authService.getAuth();
        if (!auth || !auth.token || !auth.baseUrl) {
            console.log(chalk_1.default.yellow("❌ Not logged in"));
            console.log(chalk_1.default.gray("Run 'bin-env login' to authenticate"));
            return;
        }
        console.log(chalk_1.default.green("✅ Logged in"));
        console.log(chalk_1.default.gray(`Base URL: ${auth.baseUrl}`));
        // Optional: Show login timestamp
        if (auth.timestamp) {
            const loginDate = new Date(auth.timestamp);
            console.log(chalk_1.default.gray(`Logged in at: ${loginDate.toLocaleString()}`));
        }
    }
    catch (error) {
        console.log(chalk_1.default.red("❌ Error checking status"));
        console.log(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
//# sourceMappingURL=status.js.map