#!/usr/bin/env -S deno run --allow-read --allow-env

import { cli } from "gunshi";
import { dailyCommand } from "./commands/daily.ts";
import { sessionCommand } from "./commands/session.ts";

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
