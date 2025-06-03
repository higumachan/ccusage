import { assertEquals } from "@std/testing/asserts.ts";
import { formatCurrency, formatNumber } from "./utils.ts";

Deno.test("formatNumber - formats positive numbers with comma separators", () => {
	assertEquals(formatNumber(1000), "1,000");
	assertEquals(formatNumber(1000000), "1,000,000");
	assertEquals(formatNumber(1234567.89), "1,234,567.89");
});

Deno.test("formatNumber - formats small numbers without separators", () => {
	assertEquals(formatNumber(0), "0");
	assertEquals(formatNumber(1), "1");
	assertEquals(formatNumber(999), "999");
});

Deno.test("formatNumber - formats negative numbers", () => {
	assertEquals(formatNumber(-1000), "-1,000");
	assertEquals(formatNumber(-1234567.89), "-1,234,567.89");
});

Deno.test("formatNumber - formats decimal numbers", () => {
	assertEquals(formatNumber(1234.56), "1,234.56");
	assertEquals(formatNumber(0.123), "0.123");
});

Deno.test("formatNumber - handles edge cases", () => {
	assertEquals(formatNumber(Number.MAX_SAFE_INTEGER), "9,007,199,254,740,991");
	assertEquals(formatNumber(Number.MIN_SAFE_INTEGER), "-9,007,199,254,740,991");
});

Deno.test("formatCurrency - formats positive amounts", () => {
	assertEquals(formatCurrency(10), "$10.00");
	assertEquals(formatCurrency(100.5), "$100.50");
	assertEquals(formatCurrency(1234.56), "$1234.56");
});

Deno.test("formatCurrency - formats zero", () => {
	assertEquals(formatCurrency(0), "$0.00");
});

Deno.test("formatCurrency - formats negative amounts", () => {
	assertEquals(formatCurrency(-10), "$-10.00");
	assertEquals(formatCurrency(-100.5), "$-100.50");
});

Deno.test("formatCurrency - rounds to two decimal places", () => {
	assertEquals(formatCurrency(10.999), "$11.00");
	assertEquals(formatCurrency(10.994), "$10.99");
	assertEquals(formatCurrency(10.995), "$10.99"); // JavaScript's toFixed uses banker's rounding
});

Deno.test("formatCurrency - handles small decimal values", () => {
	assertEquals(formatCurrency(0.01), "$0.01");
	assertEquals(formatCurrency(0.001), "$0.00");
	assertEquals(formatCurrency(0.009), "$0.01");
});

Deno.test("formatCurrency - handles large numbers", () => {
	assertEquals(formatCurrency(1000000), "$1000000.00");
	assertEquals(formatCurrency(9999999.99), "$9999999.99");
});
