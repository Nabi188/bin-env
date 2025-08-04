"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutCommand = logoutCommand;
const chalk_1 = __importDefault(require("chalk"));
const auth_1 = require("../services/auth");
async function logoutCommand() {
    console.log(chalk_1.default.blue("🚪 Logout from bin-env"));
    console.log();
    try {
        // Check if user is authenticated
        if (!auth_1.authService.isAuthenticated()) {
            console.log(chalk_1.default.yellow("⚠️  You are not currently logged in"));
            return;
        }
        // Clear authentication data
        auth_1.authService.clearAuth();
        console.log(chalk_1.default.green("✅ Logout successful!"));
        console.log(chalk_1.default.gray("Authentication data cleared"));
    }
    catch (error) {
        console.log(chalk_1.default.red("❌ Logout failed"));
        console.log(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
//# sourceMappingURL=logout.js.map