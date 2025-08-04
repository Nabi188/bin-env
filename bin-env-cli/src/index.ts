#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { pullCommand } from "./commands/pull";

const program = new Command();

program
  .name("bin-env")
  .description("CLI tool for managing environment files")
  .version("1.0.0");

// Login command
program
  .command("login")
  .description("Login to the environment file server")
  .action(async () => {
    await loginCommand();
  });

// Logout command
program
  .command("logout")
  .description("Logout and clear authentication data")
  .action(async () => {
    await logoutCommand();
  });

// Pull command
program
  .command("pull")
  .description("Pull environment files from the server")
  .action(async () => {
    await pullCommand();
  });

// Global error handling
process.on("uncaughtException", (error) => {
  console.log(chalk.red("❌ An unexpected error occurred:"));
  console.log(chalk.red(error.message));
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.log(chalk.red("❌ An unexpected error occurred:"));
  console.log(chalk.red(String(reason)));
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️  Operation cancelled by user"));
  process.exit(0);
});

// Parse command line arguments
program.parse();
