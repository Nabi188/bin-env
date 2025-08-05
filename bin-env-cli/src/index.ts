#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { readFileSync } from "fs";
import { join } from "path";
import {
  loginCommand,
  logoutCommand,
  pullCommand,
  statusCommand,
  versionCommand,
  updateCommand,
} from "./commands";

// Xử lý flag version sớm để không cần load commander đầy đủ
const args = process.argv;
if (args.includes("-v") || args.includes("--version") || args.includes("-V")) {
  versionCommand().then(() => process.exit(0));
}

// Đọc version cho CLI nếu cần
const { version } = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf8")
);

const program = new Command();

program
  .name("bin-env")
  .description("CLI tool for managing environment files")
  .version(version, "-v, --version", "Show version information") // auto handle flags
  .addHelpText(
    "after",
    "\nRun 'bin-env update' to check for the latest version."
  );

// Định nghĩa các lệnh
program
  .command("login")
  .description("Login to the environment file server")
  .action(loginCommand);

program
  .command("logout")
  .description("Logout and clear authentication data")
  .action(logoutCommand);

program
  .command("pull")
  .description("Pull environment files from the server")
  .action(pullCommand);

program
  .command("status")
  .description("Check current login status and base URL")
  .action(statusCommand);

program
  .command("version")
  .description("Show version information and check for updates")
  .action(versionCommand);

program
  .command("update")
  .description("Update bin-env to the latest version")
  .action(updateCommand);

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error(chalk.red("❌ Uncaught exception:"), err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(chalk.red("❌ Unhandled rejection:"), String(reason));
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️  Operation cancelled by user"));
  process.exit(0);
});

program.parse();
