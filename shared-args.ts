import type { Args } from "gunshi";
import { getDefaultClaudePath } from "./data-loader.ts";

const dateRegex = /^\d{8}$/;

const parseDateArg = (value: string): string => {
	if (!dateRegex.test(value)) {
		throw new TypeError("Date must be in YYYYMMDD format");
	}
	return value;
};

export const sharedArgs = {
	since: {
		type: "custom",
		short: "s",
		description: "Filter from date (YYYYMMDD format)",
		parse: parseDateArg,
	},
	until: {
		type: "custom",
		short: "u",
		description: "Filter until date (YYYYMMDD format)",
		parse: parseDateArg,
	},
	path: {
		type: "string",
		short: "p",
		description: "Custom path to Claude data directory",
		default: getDefaultClaudePath(),
	},
	json: {
		type: "boolean",
		short: "j",
		description: "Output in JSON format",
		default: false,
	},
} as const satisfies Args;
