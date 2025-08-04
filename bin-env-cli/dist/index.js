#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const login_1 = require("./commands/login");
const logout_1 = require("./commands/logout");
const pull_1 = require("./commands/pull");
const program = new commander_1.Command();
program
    .name("bin-env")
    .description("CLI tool for managing environment files")
    .version("1.0.0");
// Login command
program
    .command("login")
    .description("Login to the environment file server")
    .action(async () => {
    await (0, login_1.loginCommand)();
});
// Logout command
program
    .command("logout")
    .description("Logout and clear authentication data")
    .action(async () => {
    await (0, logout_1.logoutCommand)();
});
// Pull command
program
    .command("pull")
    .description("Pull environment files from the server")
    .action(async () => {
    await (0, pull_1.pullCommand)();
});
// Global error handling
process.on("uncaughtException", (error) => {
    console.log(chalk_1.default.red("❌ An unexpected error occurred:"));
    console.log(chalk_1.default.red(error.message));
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.log(chalk_1.default.red("❌ An unexpected error occurred:"));
    console.log(chalk_1.default.red(String(reason)));
    process.exit(1);
});
// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
    console.log(chalk_1.default.yellow("\n⚠️  Operation cancelled by user"));
    process.exit(0);
});
// Parse command line arguments
program.parse();
//# sourceMappingURL=index.js.map