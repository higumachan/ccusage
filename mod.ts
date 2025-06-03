#!/usr/bin/env -S deno run --allow-read --allow-env

// Remote-executable version of ccusage
// Run with: deno run --allow-read --allow-env https://raw.githubusercontent.com/higumachan/ccusage/main/mod.ts

import { cli } from "npm:gunshi@0.25.0";
import { dailyCommand } from "./commands/daily-remote.ts";
import { sessionCommand } from "./commands/session-remote.ts";

// Package info
const name = "ccusage";
const version = "0.3.2";
const description = "Usage analysis tool for Claude Code";

// Create subcommands map
const subCommands = new Map();
subCommands.set("daily", dailyCommand);
subCommands.set("session", sessionCommand);

const mainCommand = dailyCommand;

await cli(Deno.args, mainCommand, {
	name,
	version,
	description,
	subCommands,
	renderHeader: null,
});