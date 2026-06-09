import { describe, it, expect, vi, afterEach } from "vitest";
import {
	serializeForm,
	parseFormImport,
	validateFields,
	downloadFormJson,
} from "./io";
import type { Form, FormField } from "@/lib/types/form";
import type { FormExport } from "./form-export-schema";

const sampleField: FormField = {
	id: "f1",
	type: "text",
	label: "Full Name",
	required: true,
	placeholder: "Enter your name",
};

const sampleForm: Form = {
	id: "form-001",
	name: "Contact Form",
	nameEs: "Formulario de Contacto",
	description: "A simple contact form",
	descriptionEs: "Un formulario de contacto simple",
	status: "draft",
	currentVersion: 0,
	draftFields: [sampleField],
	versions: [],
	createdAt: "2025-01-01T00:00:00.000Z",
	updatedAt: "2025-01-01T00:00:00.000Z",
	tags: ["contact", "simple"],
};

describe("serializeForm", () => {
	it("produces a canonical export object with metadata", () => {
		const result = serializeForm(sampleForm, [sampleField]);

		expect(result.metadata.version).toBe("1.0");
		expect(result.metadata.kind).toBe("form");
		expect(result.metadata.exportedAt).toBeTruthy();

		expect(result.form.name).toBe("Contact Form");
		expect(result.form.nameEs).toBe("Formulario de Contacto");
		expect(result.form.description).toBe("A simple contact form");
		expect(result.form.descriptionEs).toBe("Un formulario de contacto simple");
		expect(result.form.tags).toEqual(["contact", "simple"]);

		expect(result.fields).toHaveLength(1);
		expect(result.fields[0].id).toBe("f1");
		expect(result.fields[0].label).toBe("Full Name");
	});

	it("does not include the form ID in the export", () => {
		const result = serializeForm(sampleForm, [sampleField]);
		const json = JSON.stringify(result);
		expect(json).not.toContain("form-001");
	});

	it("handles form with no optional fields", () => {
		const minimalForm: Form = {
			...sampleForm,
			nameEs: undefined,
			descriptionEs: undefined,
			tags: [],
		};
		const result = serializeForm(minimalForm, []);

		expect(result.form.nameEs).toBeUndefined();
		expect(result.form.descriptionEs).toBeUndefined();
		expect(result.form.tags).toEqual([]);
		expect(result.fields).toEqual([]);
	});
});

describe("parseFormImport", () => {
	it("parses a canonical export JSON", () => {
		const exported = serializeForm(sampleForm, [sampleField]);
		const json = JSON.stringify(exported);

		const parsed = parseFormImport(json);
		expect(parsed.metadata.kind).toBe("form");
		expect(parsed.form.name).toBe("Contact Form");
		expect(parsed.fields).toHaveLength(1);
		expect(parsed.fields[0].type).toBe("text");
	});

	it("round-trips serialize -> parse without data loss", () => {
		const original = serializeForm(sampleForm, [sampleField]);
		const json = JSON.stringify(original);
		const parsed = parseFormImport(json);

		expect(parsed.form.name).toBe(original.form.name);
		expect(parsed.form.nameEs).toBe(original.form.nameEs);
		expect(parsed.form.description).toBe(original.form.description);
		expect(parsed.form.tags).toEqual(original.form.tags);
		expect(parsed.fields).toEqual(original.fields);
	});

	it("parses legacy format (form + fields, no metadata)", () => {
		const legacy = {
			form: {
				name: "Legacy Form",
				description: "Test",
				tags: [],
			},
			fields: [
				{
					id: "f1",
					type: "email",
					label: "Email",
					required: true,
				},
			],
		};

		const parsed = parseFormImport(JSON.stringify(legacy));
		expect(parsed.metadata.kind).toBe("form");
		expect(parsed.form.name).toBe("Legacy Form");
		expect(parsed.fields[0].type).toBe("email");
	});

	it("throws on invalid JSON", () => {
		expect(() => parseFormImport("not json")).toThrow("Error parsing JSON");
	});

	it("throws on non-object JSON", () => {
		expect(() => parseFormImport('"hello"')).toThrow("expected a JSON object");
	});

	it("throws when kind is not 'form'", () => {
		const wrong = {
			metadata: { version: "1.0", kind: "workflow", exportedAt: "" },
			form: { name: "X", description: "" },
			fields: [],
		};
		expect(() => parseFormImport(JSON.stringify(wrong))).toThrow(
			"not a form definition",
		);
	});

	it("throws on missing required form fields", () => {
		const bad = {
			metadata: { version: "1.0", kind: "form", exportedAt: "" },
			form: { description: "" },
			fields: [],
		};
		expect(() => parseFormImport(JSON.stringify(bad))).toThrow();
	});

	it("throws on invalid field types", () => {
		const bad = {
			metadata: {
				version: "1.0",
				kind: "form",
				exportedAt: new Date().toISOString(),
			},
			form: { name: "Test", description: "" },
			fields: [
				{
					id: "f1",
					type: "invalid_type",
					label: "Bad",
					required: true,
				},
			],
		};
		expect(() => parseFormImport(JSON.stringify(bad))).toThrow();
	});

	it("parses bare root format { name, fields } without form wrapper", () => {
		const bareRoot = {
			name: "Bare Root Form",
			description: "A bare root form",
			fields: [{ id: "f1", type: "text", label: "Name", required: true }],
		};
		const parsed = parseFormImport(JSON.stringify(bareRoot));
		expect(parsed.metadata.kind).toBe("form");
		expect(parsed.form.name).toBe("Bare Root Form");
		expect(parsed.fields).toHaveLength(1);
	});

	it("parses bare root format with optional fields", () => {
		const bareRoot = {
			name: "Tagged Form",
			description: "With tags",
			nameEs: "Formulario",
			descriptionEs: "Con etiquetas",
			tags: ["a", "b"],
			fields: [{ id: "f1", type: "email", label: "Email", required: false }],
		};
		const parsed = parseFormImport(JSON.stringify(bareRoot));
		expect(parsed.form.name).toBe("Tagged Form");
		expect(parsed.form.tags).toEqual(["a", "b"]);
	});

	it("throws a path-aware error on invalid canonical JSON", () => {
		const bad = {
			metadata: { version: "1.0", kind: "form", exportedAt: "" },
			form: {},
			fields: [],
		};
		expect(() => parseFormImport(JSON.stringify(bad))).toThrow(
			/Invalid format:/,
		);
	});
});

describe("downloadFormJson", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	const sampleExport: FormExport = {
		metadata: {
			version: "1.0",
			kind: "form",
			exportedAt: "2025-01-01T00:00:00.000Z",
		},
		form: { name: "My Export Form", description: "desc", tags: [] },
		fields: [],
	};

	it("creates a download anchor and clicks it", () => {
		const mockClick = vi.fn();
		const mockRevoke = vi.fn();
		vi.stubGlobal("URL", {
			createObjectURL: vi.fn(() => "blob:mock-url"),
			revokeObjectURL: mockRevoke,
		});
		const anchorEl = {
			href: "",
			download: "",
			click: mockClick,
		} as unknown as HTMLAnchorElement;
		vi.spyOn(document, "createElement").mockReturnValue(anchorEl);

		downloadFormJson(sampleExport);

		expect(anchorEl.href).toBe("blob:mock-url");
		expect(anchorEl.download).toMatch(/^form-my-export-form-\d+\.json$/);
		expect(mockClick).toHaveBeenCalledOnce();
		expect(mockRevoke).toHaveBeenCalledWith("blob:mock-url");
	});

	it("uses provided filename when specified", () => {
		const mockClick = vi.fn();
		vi.stubGlobal("URL", {
			createObjectURL: vi.fn(() => "blob:custom-url"),
			revokeObjectURL: vi.fn(),
		});
		const anchorEl = {
			href: "",
			download: "",
			click: mockClick,
		} as unknown as HTMLAnchorElement;
		vi.spyOn(document, "createElement").mockReturnValue(anchorEl);

		downloadFormJson(sampleExport, "custom-name.json");

		expect(anchorEl.download).toBe("custom-name.json");
		expect(mockClick).toHaveBeenCalledOnce();
	});

	it("uses 'export' slug fallback when name produces empty slug", () => {
		const mockClick = vi.fn();
		vi.stubGlobal("URL", {
			createObjectURL: vi.fn(() => "blob:fallback-url"),
			revokeObjectURL: vi.fn(),
		});
		const anchorEl = {
			href: "",
			download: "",
			click: mockClick,
		} as unknown as HTMLAnchorElement;
		vi.spyOn(document, "createElement").mockReturnValue(anchorEl);

		const exportWithSymbolName: FormExport = {
			...sampleExport,
			form: { ...sampleExport.form, name: "---" },
		};
		downloadFormJson(exportWithSymbolName);

		expect(anchorEl.download).toMatch(/^form-export-\d+\.json$/);
	});
});

describe("validateFields", () => {
	it("validates correct fields", () => {
		const fields = [
			{ id: "f1", type: "text", label: "Name", required: true },
			{ id: "f2", type: "email", label: "Email", required: false },
		];
		const result = validateFields(fields);
		expect(result).toHaveLength(2);
		expect(result[0].type).toBe("text");
	});

	it("throws on invalid field type", () => {
		const fields = [
			{ id: "f1", type: "nonexistent", label: "Bad", required: true },
		];
		expect(() => validateFields(fields)).toThrow();
	});

	it("throws on missing required field properties", () => {
		const fields = [{ id: "f1", type: "text" }];
		expect(() => validateFields(fields)).toThrow();
	});

	it("accepts fields with all optional properties", () => {
		const fields = [
			{
				id: "f1",
				type: "text" as const,
				label: "Full",
				required: true,
				labelEs: "Completo",
				placeholder: "Enter here",
				placeholderEs: "Escribe aquí",
				options: ["a", "b"],
				optionsEs: ["x", "y"],
				validation: { min: 1, max: 100, minLength: 2, maxLength: 50 },
				properties: { rows: 3, maxRating: 5, allowHalf: true },
			},
		];
		const result = validateFields(fields);
		expect(result[0].labelEs).toBe("Completo");
		expect(result[0].validation?.minLength).toBe(2);
	});
});
