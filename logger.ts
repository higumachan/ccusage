// Simple logger implementation for Deno
export const logger = {
	info: (...args: unknown[]) => console.info("[ccusage]", ...args),
	error: (...args: unknown[]) => console.error("[ccusage]", ...args),
	warn: (...args: unknown[]) => console.warn("[ccusage]", ...args),
	debug: (...args: unknown[]) => console.debug("[ccusage]", ...args),
};

export const log = (...args: unknown[]) => console.log(...args);
