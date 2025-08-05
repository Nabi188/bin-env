#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const path_1 = require("path");
const commands_1 = require("./commands");
// Xử lý flag version sớm để không cần load commander đầy đủ
const args = process.argv;
if (args.includes("-v") || args.includes("--version") || args.includes("-V")) {
    (0, commands_1.versionCommand)().then(() => process.exit(0));
}
// Đọc version cho CLI nếu cần
const { version } = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../package.json"), "utf8"));
const program = new commander_1.Command();
program
    .name("bin-env")
    .description("CLI tool for managing environment files")
    .version(version, "-v, --version", "Show version information") // auto handle flags
    .addHelpText("after", "\nRun 'bin-env update' to check for the latest version.");
// Định nghĩa các lệnh
program
    .command("login")
    .description("Login to the environment file server")
    .action(commands_1.loginCommand);
program
    .command("logout")
    .description("Logout and clear authentication data")
    .action(commands_1.logoutCommand);
program
    .command("pull")
    .description("Pull environment files from the server")
    .action(commands_1.pullCommand);
program
    .command("status")
    .description("Check current login status and base URL")
    .action(commands_1.statusCommand);
program
    .command("version")
    .description("Show version information and check for updates")
    .action(commands_1.versionCommand);
program
    .command("update")
    .description("Update bin-env to the latest version")
    .action(commands_1.updateCommand);
// Global error handlers
process.on("uncaughtException", (err) => {
    console.error(chalk_1.default.red("❌ Uncaught exception:"), err.message);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.error(chalk_1.default.red("❌ Unhandled rejection:"), String(reason));
    process.exit(1);
});
process.on("SIGINT", () => {
    console.log(chalk_1.default.yellow("\n⚠️  Operation cancelled by user"));
    process.exit(0);
});
program.parse();
//# sourceMappingURL=index.js.map