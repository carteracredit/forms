import type { FormField } from "@/lib/types/form";

/**
 * Computes a SHA-256 hash of a string using the Web Crypto API.
 * Works in both browser and Node.js (v18+) environments.
 */
export async function computeSha256(input: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Normalizes an array of form fields into a stable JSON string for hashing.
 *
 * Sorts fields by id and recursively sorts object keys to ensure
 * key-insertion order differences don't produce different checksums.
 */
export function normalizeFieldsForChecksum(fields: FormField[]): string {
	const sorted = [...fields].sort((a, b) => a.id.localeCompare(b.id));
	return JSON.stringify(sorted, sortedKeys);
}

function sortedKeys(_key: string, value: unknown): unknown {
	if (value !== null && typeof value === "object" && !Array.isArray(value)) {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
				a.localeCompare(b),
			),
		);
	}
	return value;
}

/**
 * Computes a SHA-256 checksum of a normalized fields array.
 */
export async function computeFieldsChecksum(
	fields: FormField[],
): Promise<string> {
	return computeSha256(normalizeFieldsForChecksum(fields));
}
