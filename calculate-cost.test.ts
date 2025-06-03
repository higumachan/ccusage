import { assertEquals } from "@std/testing/asserts.ts";
import { calculateTotals, createTotalsObject, getTotalTokens } from "./calculate-cost.ts";
import type { DailyUsage, SessionUsage } from "./data-loader.ts";

Deno.test("calculateTotals should aggregate daily usage data", () => {
	const dailyData: DailyUsage[] = [
		{
			date: "2024-01-01",
			inputTokens: 100,
			outputTokens: 50,
			cacheCreationTokens: 25,
			cacheReadTokens: 10,
			totalCost: 0.01,
		},
		{
			date: "2024-01-02",
			inputTokens: 200,
			outputTokens: 100,
			cacheCreationTokens: 50,
			cacheReadTokens: 20,
			totalCost: 0.02,
		},
	];

	const totals = calculateTotals(dailyData);
	assertEquals(totals.inputTokens, 300);
	assertEquals(totals.outputTokens, 150);
	assertEquals(totals.cacheCreationTokens, 75);
	assertEquals(totals.cacheReadTokens, 30);
	assertEquals(Math.round(totals.totalCost * 100) / 100, 0.03);
});

Deno.test("calculateTotals should aggregate session usage data", () => {
	const sessionData: SessionUsage[] = [
		{
			sessionId: "session-1",
			projectPath: "project/path",
			inputTokens: 100,
			outputTokens: 50,
			cacheCreationTokens: 25,
			cacheReadTokens: 10,
			totalCost: 0.01,
			lastActivity: "2024-01-01",
		},
		{
			sessionId: "session-2",
			projectPath: "project/path",
			inputTokens: 200,
			outputTokens: 100,
			cacheCreationTokens: 50,
			cacheReadTokens: 20,
			totalCost: 0.02,
			lastActivity: "2024-01-02",
		},
	];

	const totals = calculateTotals(sessionData);
	assertEquals(totals.inputTokens, 300);
	assertEquals(totals.outputTokens, 150);
	assertEquals(totals.cacheCreationTokens, 75);
	assertEquals(totals.cacheReadTokens, 30);
	assertEquals(Math.round(totals.totalCost * 100) / 100, 0.03);
});

Deno.test("getTotalTokens should sum all token types", () => {
	const tokens = {
		inputTokens: 100,
		outputTokens: 50,
		cacheCreationTokens: 25,
		cacheReadTokens: 10,
	};

	const total = getTotalTokens(tokens);
	assertEquals(total, 185);
});

Deno.test("getTotalTokens should handle zero values", () => {
	const tokens = {
		inputTokens: 0,
		outputTokens: 0,
		cacheCreationTokens: 0,
		cacheReadTokens: 0,
	};

	const total = getTotalTokens(tokens);
	assertEquals(total, 0);
});

Deno.test("createTotalsObject should create complete totals object", () => {
	const totals = {
		inputTokens: 100,
		outputTokens: 50,
		cacheCreationTokens: 25,
		cacheReadTokens: 10,
		totalCost: 0.01,
	};

	const totalsObject = createTotalsObject(totals);
	assertEquals(totalsObject, {
		inputTokens: 100,
		outputTokens: 50,
		cacheCreationTokens: 25,
		cacheReadTokens: 10,
		totalTokens: 185,
		totalCost: 0.01,
	});
});

Deno.test("calculateTotals should handle empty array", () => {
	const totals = calculateTotals([]);
	assertEquals(totals, {
		inputTokens: 0,
		outputTokens: 0,
		cacheCreationTokens: 0,
		cacheReadTokens: 0,
		totalCost: 0,
	});
});
