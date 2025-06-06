import Table from "npm:cli-table3@0.6.5";
import { define } from "npm:gunshi@0.25.0";
import pc from "npm:picocolors@1.1.1";
import { calculateTotals, createTotalsObject, getTotalTokens } from "../calculate-cost.ts";
import { type LoadOptions, loadUsageData } from "../data-loader-remote.ts";
import { log, logger } from "../logger.ts";
import { sharedArgs } from "../shared-args-remote.ts";
import { formatCurrency, formatNumber } from "../utils.ts";

export const dailyCommand = define({
	name: "daily",
	description: "Show usage report grouped by date",
	args: sharedArgs,
	async run(ctx) {
		const options: LoadOptions = {
			since: ctx.values.since,
			until: ctx.values.until,
			claudePath: ctx.values.path,
		};
		const dailyData = await loadUsageData(options);

		if (dailyData.length === 0) {
			if (ctx.values.json) {
				log(JSON.stringify([]));
			} else {
				logger.warn("No Claude usage data found.");
			}
			Deno.exit(0);
		}

		// Calculate totals
		const totals = calculateTotals(dailyData);

		if (ctx.values.json) {
			// Output JSON format
			const jsonOutput = {
				daily: dailyData.map((data) => ({
					date: data.date,
					inputTokens: data.inputTokens,
					outputTokens: data.outputTokens,
					cacheCreationTokens: data.cacheCreationTokens,
					cacheReadTokens: data.cacheReadTokens,
					totalTokens: getTotalTokens(data),
					totalCost: data.totalCost,
				})),
				totals: createTotalsObject(totals),
			};
			log(JSON.stringify(jsonOutput, null, 2));
		} else {
			// Print header
			log("\n" + pc.cyan("Claude Code Token Usage Report - Daily") + "\n");

			// Create table
			const table = new Table({
				head: [
					"Date",
					"Input",
					"Output",
					"Cache Create",
					"Cache Read",
					"Total Tokens",
					"Cost (USD)",
				],
				style: {
					head: ["cyan"],
				},
				colAligns: [
					"left",
					"right",
					"right",
					"right",
					"right",
					"right",
					"right",
				],
			});

			// Add daily data
			for (const data of dailyData) {
				table.push([
					data.date,
					formatNumber(data.inputTokens),
					formatNumber(data.outputTokens),
					formatNumber(data.cacheCreationTokens),
					formatNumber(data.cacheReadTokens),
					formatNumber(getTotalTokens(data)),
					formatCurrency(data.totalCost),
				]);
			}

			// Add separator
			table.push([
				"─".repeat(12),
				"─".repeat(12),
				"─".repeat(12),
				"─".repeat(12),
				"─".repeat(12),
				"─".repeat(12),
				"─".repeat(10),
			]);

			// Add totals
			table.push([
				pc.yellow("Total"),
				pc.yellow(formatNumber(totals.inputTokens)),
				pc.yellow(formatNumber(totals.outputTokens)),
				pc.yellow(formatNumber(totals.cacheCreationTokens)),
				pc.yellow(formatNumber(totals.cacheReadTokens)),
				pc.yellow(formatNumber(getTotalTokens(totals))),
				pc.yellow(formatCurrency(totals.totalCost)),
			]);

			// biome-ignore lint/suspicious/noConsole: <explanation>
			console.log(table.toString());
		}
	},
});