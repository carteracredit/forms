import { describe, it, expect } from "vitest";
import {
	getCurrentVersion,
	getCurrentFields,
	getCurrentSchema,
	type Form,
	type FormVersion,
	type FormField,
} from "./form";

describe("form type helpers", () => {
	const mockForm: Form = {
		id: "1",
		name: "Test Form",
		description: "A test form",
		status: "draft",
		currentVersion: 2,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		tags: ["test"],
		versions: [
			{
				id: "v1",
				version: 1,
				createdAt: "2024-01-01T00:00:00Z",
				createdBy: "User 1",
				fields: [
					{
						id: "f1",
						type: "text",
						label: "Field 1",
						required: true,
					},
				],
				schema: {
					input: { prefill: "string" },
					output: { field1: "string" },
				},
			},
			{
				id: "v2",
				version: 2,
				createdAt: "2024-01-02T00:00:00Z",
				createdBy: "User 2",
				changelog: "Added new field",
				fields: [
					{
						id: "f1",
						type: "text",
						label: "Field 1",
						required: true,
					},
					{
						id: "f2",
						type: "email",
						label: "Email Field",
						required: false,
					},
				],
				schema: {
					input: { prefill: "string" },
					output: { field1: "string", field2: "string" },
				},
			},
		],
	};

	describe("getCurrentVersion", () => {
		it("should return the current version", () => {
			const version = getCurrentVersion(mockForm);
			expect(version).toBeDefined();
			expect(version?.version).toBe(2);
			expect(version?.id).toBe("v2");
		});

		it("should return undefined if version not found", () => {
			const formWithBadVersion: Form = {
				...mockForm,
				currentVersion: 999,
			};
			const version = getCurrentVersion(formWithBadVersion);
			expect(version).toBeUndefined();
		});
	});

	describe("getCurrentFields", () => {
		it("should return fields from the current version", () => {
			const fields = getCurrentFields(mockForm);
			expect(fields).toHaveLength(2);
			expect(fields[0].id).toBe("f1");
			expect(fields[1].id).toBe("f2");
		});

		it("should return empty array if version not found", () => {
			const formWithBadVersion: Form = {
				...mockForm,
				currentVersion: 999,
			};
			const fields = getCurrentFields(formWithBadVersion);
			expect(fields).toEqual([]);
		});
	});

	describe("getCurrentSchema", () => {
		it("should return schema from the current version", () => {
			const schema = getCurrentSchema(mockForm);
			expect(schema).toBeDefined();
			expect(schema?.input).toEqual({ prefill: "string" });
			expect(schema?.output).toEqual({ field1: "string", field2: "string" });
		});

		it("should return undefined if version not found", () => {
			const formWithBadVersion: Form = {
				...mockForm,
				currentVersion: 999,
			};
			const schema = getCurrentSchema(formWithBadVersion);
			expect(schema).toBeUndefined();
		});
	});
});
