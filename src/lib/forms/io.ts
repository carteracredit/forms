import type { Form, FormField } from "@/lib/types/form";
import {
	formExportSchema,
	formFieldSchema,
	type FormExport,
} from "./form-export-schema";
import {
	isResolvedRangeInvalid,
	offsetHasDisallowedUnits,
	type DateFieldKind,
	type DateOffset,
} from "./date-constraints";
import { z } from "zod";

/**
 * Serializes a form and its current fields into the canonical export format.
 */
export function serializeForm(form: Form, fields: FormField[]): FormExport {
	return {
		metadata: {
			version: "1.0",
			kind: "form",
			exportedAt: new Date().toISOString(),
		},
		form: {
			name: form.name,
			...(form.nameEs ? { nameEs: form.nameEs } : {}),
			description: form.description,
			...(form.descriptionEs ? { descriptionEs: form.descriptionEs } : {}),
			tags: form.tags ?? [],
		},
		fields: fields.map((f) => ({ ...f })),
	};
}

/**
 * Parses and validates a raw JSON string as a form export.
 *
 * Supports both canonical format (with `metadata.kind: "form"`) and
 * legacy format (flat `{ form, fields }` without metadata).
 *
 * @throws {Error} with a user-facing message when the JSON is invalid.
 */
export function parseFormImport(raw: string): FormExport {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		throw new Error("Error parsing JSON");
	}

	if (typeof data !== "object" || data === null) {
		throw new Error("Invalid format: expected a JSON object");
	}

	const obj = data as Record<string, unknown>;

	// Validate metadata.kind if present
	if (obj.metadata && typeof obj.metadata === "object") {
		const meta = obj.metadata as Record<string, unknown>;
		if (meta.kind && meta.kind !== "form") {
			throw new Error("Invalid format: this JSON is not a form definition");
		}
	}

	// Try canonical schema first
	const canonical = formExportSchema.safeParse(obj);
	if (canonical.success) {
		return canonical.data;
	}

	// Legacy format: { form, fields } without metadata
	if (obj.form && obj.fields && Array.isArray(obj.fields)) {
		const withMeta = {
			metadata: {
				version: "1.0",
				kind: "form" as const,
				exportedAt: new Date().toISOString(),
			},
			...obj,
		};
		const result = formExportSchema.safeParse(withMeta);
		if (result.success) return result.data;
	}

	// Try just a bare fields array with form metadata in the root
	if (obj.fields && Array.isArray(obj.fields) && obj.name) {
		const normalized = {
			metadata: {
				version: "1.0",
				kind: "form" as const,
				exportedAt: new Date().toISOString(),
			},
			form: {
				name: obj.name,
				nameEs: obj.nameEs,
				description: obj.description ?? "",
				descriptionEs: obj.descriptionEs,
				tags: obj.tags ?? [],
			},
			fields: obj.fields,
		};
		const result = formExportSchema.safeParse(normalized);
		if (result.success) return result.data;
	}

	// Build a helpful error from the canonical parse
	const issues = canonical.error.issues;
	const firstIssue = issues[0];
	if (firstIssue) {
		const path = firstIssue.path.join(".");
		throw new Error(`Invalid format: ${path} — ${firstIssue.message}`);
	}

	/* istanbul ignore next */
	throw new Error("Invalid form export format");
}

function dateKind(type: string): DateFieldKind | null {
	if (type === "date" || type === "datetime" || type === "month") return type;
	return null;
}

function offsetsForKind(
	kind: DateFieldKind,
	properties: FormField["properties"],
): DateOffset[] {
	if (!properties) return [];
	if (kind === "month") {
		return [properties.monthMinOffset, properties.monthMaxOffset].filter(
			(o): o is DateOffset => o != null,
		);
	}
	return [properties.dateMinOffset, properties.dateMaxOffset].filter(
		(o): o is DateOffset => o != null,
	);
}

/**
 * Validates an array of fields against the field schema.
 * Returns the validated fields or throws with a descriptive error.
 */
export function validateFields(fields: unknown[]): FormField[] {
	const parsed = z.array(formFieldSchema).parse(fields) as FormField[];
	const now = new Date();
	for (const field of parsed) {
		const kind = dateKind(field.type);
		if (!kind) continue;
		for (const offset of offsetsForKind(kind, field.properties)) {
			if (offsetHasDisallowedUnits(kind, offset)) {
				throw new Error(
					`Field "${field.label}" has offset units that are not allowed for type ${kind}`,
				);
			}
		}
		if (isResolvedRangeInvalid(kind, field.properties, now)) {
			throw new Error(
				`Field "${field.label}" has a minimum later than its maximum`,
			);
		}
	}
	return parsed;
}

/**
 * Triggers a browser download of the form export as a JSON file.
 */
export function downloadFormJson(
	exportData: FormExport,
	filename?: string,
): void {
	const json = JSON.stringify(exportData, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;

	const slug = exportData.form.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
	a.download = filename ?? `form-${slug || "export"}-${Date.now()}.json`;

	a.click();
	URL.revokeObjectURL(url);
}
