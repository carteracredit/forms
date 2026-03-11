import { describe, it, expect } from "vitest";
import type { FormField } from "@/lib/types/form";
import {
	computeSha256,
	normalizeFieldsForChecksum,
	computeFieldsChecksum,
} from "./checksum";

const baseField: FormField = {
	id: "f1",
	type: "text",
	label: "Name",
	required: true,
};

describe("computeSha256", () => {
	it("returns a 64-character hex string", async () => {
		const hash = await computeSha256("hello");
		expect(hash).toHaveLength(64);
		expect(hash).toMatch(/^[0-9a-f]+$/);
	});

	it("returns the same hash for the same input", async () => {
		const h1 = await computeSha256("test input");
		const h2 = await computeSha256("test input");
		expect(h1).toBe(h2);
	});

	it("returns different hashes for different inputs", async () => {
		const h1 = await computeSha256("aaa");
		const h2 = await computeSha256("bbb");
		expect(h1).not.toBe(h2);
	});
});

describe("normalizeFieldsForChecksum", () => {
	it("produces the same string regardless of field insertion order when ids differ", () => {
		const fields1: FormField[] = [
			{ id: "a", type: "text", label: "A", required: false },
			{ id: "b", type: "email", label: "B", required: true },
		];
		const fields2: FormField[] = [
			{ id: "b", type: "email", label: "B", required: true },
			{ id: "a", type: "text", label: "A", required: false },
		];
		expect(normalizeFieldsForChecksum(fields1)).toBe(
			normalizeFieldsForChecksum(fields2),
		);
	});

	it("produces the same string for identical objects with different key order", () => {
		const f1: FormField = {
			id: "x",
			type: "text",
			label: "X",
			required: false,
		};
		const f2: FormField = {
			label: "X",
			id: "x",
			required: false,
			type: "text",
		} as FormField;
		expect(normalizeFieldsForChecksum([f1])).toBe(
			normalizeFieldsForChecksum([f2]),
		);
	});

	it("produces different strings for different fields", () => {
		const f1: FormField[] = [
			{ id: "f1", type: "text", label: "A", required: true },
		];
		const f2: FormField[] = [
			{ id: "f1", type: "text", label: "B", required: true },
		];
		expect(normalizeFieldsForChecksum(f1)).not.toBe(
			normalizeFieldsForChecksum(f2),
		);
	});

	it("handles empty array", () => {
		expect(normalizeFieldsForChecksum([])).toBe("[]");
	});
});

describe("computeFieldsChecksum", () => {
	it("returns the same checksum for identical fields regardless of order", async () => {
		const fields1: FormField[] = [
			{ id: "a", type: "text", label: "A", required: false },
			{ id: "b", type: "email", label: "B", required: true },
		];
		const fields2: FormField[] = [
			{ id: "b", type: "email", label: "B", required: true },
			{ id: "a", type: "text", label: "A", required: false },
		];
		const [c1, c2] = await Promise.all([
			computeFieldsChecksum(fields1),
			computeFieldsChecksum(fields2),
		]);
		expect(c1).toBe(c2);
	});

	it("returns different checksums for different fields", async () => {
		const original: FormField[] = [baseField];
		const modified: FormField[] = [{ ...baseField, label: "Different" }];
		const [c1, c2] = await Promise.all([
			computeFieldsChecksum(original),
			computeFieldsChecksum(modified),
		]);
		expect(c1).not.toBe(c2);
	});

	it("returns the same checksum for an empty array", async () => {
		const c1 = await computeFieldsChecksum([]);
		const c2 = await computeFieldsChecksum([]);
		expect(c1).toBe(c2);
	});
});
