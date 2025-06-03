import { join, relative } from "@std/path";
import { SEPARATOR as sep } from "@std/path/constants.ts";
import { sort } from "fast-sort";

const readFile = async (filePath: string): Promise<string> => {
	return await Deno.readTextFile(filePath);
};

const homedir = () => Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";

const glob = async (_patterns: string[], options: { cwd: string; absolute: boolean }): Promise<string[]> => {
	const files: string[] = [];

	async function walkDir(dir: string) {
		try {
			for await (const entry of Deno.readDir(dir)) {
				const path = join(dir, entry.name);

				if (entry.isFile && entry.name.endsWith(".jsonl")) {
					files.push(options.absolute ? path : relative(options.cwd, path));
				} else if (entry.isDirectory) {
					await walkDir(path);
				}
			}
		} catch (error) {
			// Skip directories we can't read
			if (!(error instanceof Deno.errors.PermissionDenied)) {
				throw error;
			}
		}
	}

	await walkDir(options.cwd);
	return files;
};

export const getDefaultClaudePath = () => join(homedir(), ".claude");

// Validation types
interface UsageMessage {
	usage: {
		input_tokens: number;
		output_tokens: number;
		cache_creation_input_tokens?: number;
		cache_read_input_tokens?: number;
	};
}

export interface UsageData {
	timestamp: string;
	message: UsageMessage;
	costUSD: number;
}

const validateUsageData = (data: unknown): UsageData | null => {
	if (!data || typeof data !== "object") return null;
	// deno-lint-ignore no-explicit-any
	const obj = data as any;
	if (
		typeof obj.timestamp !== "string" ||
		typeof obj.costUSD !== "number" ||
		!obj.message?.usage ||
		typeof obj.message.usage.input_tokens !== "number" ||
		typeof obj.message.usage.output_tokens !== "number"
	) {
		return null;
	}
	return obj as UsageData;
};

export interface DailyUsage {
	date: string;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens: number;
	cacheReadTokens: number;
	totalCost: number;
}

export interface SessionUsage {
	sessionId: string;
	projectPath: string;
	inputTokens: number;
	outputTokens: number;
	cacheCreationTokens: number;
	cacheReadTokens: number;
	totalCost: number;
	lastActivity: string;
}

export const formatDate = (dateStr: string): string => {
	const date = new Date(dateStr);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export interface DateFilter {
	since?: string; // YYYYMMDD format
	until?: string; // YYYYMMDD format
}

export interface LoadOptions extends DateFilter {
	claudePath?: string; // Custom path to Claude data directory
}

export async function loadUsageData(
	options?: LoadOptions,
): Promise<DailyUsage[]> {
	const claudePath = options?.claudePath ?? getDefaultClaudePath();
	const claudeDir = join(claudePath, "projects");
	const files = await glob(["**/*.jsonl"], {
		cwd: claudeDir,
		absolute: true,
	});

	if (files.length === 0) {
		return [];
	}

	const dailyMap = new Map<string, DailyUsage>();

	for (const file of files) {
		const content = await readFile(file);
		const lines = content
			.trim()
			.split("\n")
			.filter((line) => line.length > 0);

		for (const line of lines) {
			try {
				const parsed = JSON.parse(line);
				const data = validateUsageData(parsed);
				if (!data) {
					continue;
				}

				const date = formatDate(data.timestamp);
				const existing = dailyMap.get(date) || {
					date,
					inputTokens: 0,
					outputTokens: 0,
					cacheCreationTokens: 0,
					cacheReadTokens: 0,
					totalCost: 0,
				};

				existing.inputTokens += data.message.usage.input_tokens || 0;
				existing.outputTokens += data.message.usage.output_tokens || 0;
				existing.cacheCreationTokens += data.message.usage.cache_creation_input_tokens || 0;
				existing.cacheReadTokens += data.message.usage.cache_read_input_tokens || 0;
				existing.totalCost += data.costUSD || 0;

				dailyMap.set(date, existing);
			} catch (_e) {
				// Skip invalid JSON lines
			}
		}
	}

	// Convert map to array and filter by date range
	let results = Array.from(dailyMap.values());

	if (options?.since || options?.until) {
		results = results.filter((data) => {
			const dateStr = data.date.replace(/-/g, ""); // Convert to YYYYMMDD
			if (options.since && dateStr < options.since) return false;
			if (options.until && dateStr > options.until) return false;
			return true;
		});
	}

	// Sort by date descending
	return sort(results).desc((item) => new Date(item.date).getTime());
}

export async function loadSessionData(
	options?: LoadOptions,
): Promise<SessionUsage[]> {
	const claudePath = options?.claudePath ?? getDefaultClaudePath();
	const claudeDir = join(claudePath, "projects");
	const files = await glob(["**/*.jsonl"], {
		cwd: claudeDir,
		absolute: true,
	});

	if (files.length === 0) {
		return [];
	}

	const sessionMap = new Map<string, SessionUsage>();

	for (const file of files) {
		// Extract session info from file path
		const relativePath = relative(claudeDir, file);
		const parts = relativePath.split(sep);

		// Session ID is the directory name containing the JSONL file
		const sessionId = parts[parts.length - 2];
		// Project path is everything before the session ID
		const projectPath = parts.slice(0, -2).join(sep);

		const content = await readFile(file);
		const lines = content
			.trim()
			.split("\n")
			.filter((line) => line.length > 0);
		let lastTimestamp = "";

		for (const line of lines) {
			try {
				const parsed = JSON.parse(line);
				const data = validateUsageData(parsed);
				if (!data) {
					continue;
				}

				const key = `${projectPath}/${sessionId}`;
				const existing = sessionMap.get(key) || {
					sessionId: sessionId || "unknown",
					projectPath: projectPath || "Unknown Project",
					inputTokens: 0,
					outputTokens: 0,
					cacheCreationTokens: 0,
					cacheReadTokens: 0,
					totalCost: 0,
					lastActivity: "",
				};

				existing.inputTokens += data.message.usage.input_tokens || 0;
				existing.outputTokens += data.message.usage.output_tokens || 0;
				existing.cacheCreationTokens += data.message.usage.cache_creation_input_tokens || 0;
				existing.cacheReadTokens += data.message.usage.cache_read_input_tokens || 0;
				existing.totalCost += data.costUSD || 0;

				// Keep track of the latest timestamp
				if (data.timestamp > lastTimestamp) {
					lastTimestamp = data.timestamp;
					existing.lastActivity = formatDate(data.timestamp);
				}

				sessionMap.set(key, existing);
			} catch (_e) {
				// Skip invalid JSON lines
			}
		}
	}

	// Convert map to array and filter by date range
	let results = Array.from(sessionMap.values());

	if (options?.since || options?.until) {
		results = results.filter((session) => {
			const dateStr = session.lastActivity.replace(/-/g, ""); // Convert to YYYYMMDD
			if (options.since && dateStr < options.since) return false;
			if (options.until && dateStr > options.until) return false;
			return true;
		});
	}

	// Sort by total cost descending
	return sort(results).desc((item) => item.totalCost);
}
