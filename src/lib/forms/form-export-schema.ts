import { z } from "zod";

export const FORM_FIELD_TYPES = [
	"name",
	"phone",
	"email",
	"text",
	"textarea",
	"address",
	"file",
	"checkbox",
	"radio",
	"checkbox-group",
	"dropdown",
	"date",
	"datetime",
	"time",
	"number",
	"url",
	"password",
	"rating",
	"card",
] as const;

const formFieldValidationSchema = z
	.object({
		min: z.number().optional(),
		max: z.number().optional(),
		pattern: z.string().optional(),
		minLength: z.number().int().optional(),
		maxLength: z.number().int().optional(),
		step: z.number().optional(),
	})
	.optional();

const formFieldPropertiesSchema = z
	.object({
		rows: z.number().int().optional(),
		maxRating: z.number().int().optional(),
		allowHalf: z.boolean().optional(),
		showStrength: z.boolean().optional(),
		acceptedTypes: z.array(z.string()).optional(),
		maxFileSize: z.number().optional(),
		enableAutocomplete: z.boolean().optional(),
		enableUspsValidation: z.boolean().optional(),
		includeMiddleName: z.boolean().optional(),
		acceptedBrands: z.array(z.string()).optional(),
		requireHolderName: z.boolean().optional(),
		dateMin: z.string().optional(),
		dateMax: z.string().optional(),
	})
	.optional();

export const formFieldSchema = z.object({
	id: z.string().min(1),
	type: z.enum(FORM_FIELD_TYPES),
	label: z.string().min(1),
	labelEs: z.string().optional(),
	placeholder: z.string().optional(),
	placeholderEs: z.string().optional(),
	required: z.boolean(),
	options: z.array(z.string()).optional(),
	optionsEs: z.array(z.string()).optional(),
	validation: formFieldValidationSchema,
	properties: formFieldPropertiesSchema,
});

export const formExportMetadataSchema = z.object({
	version: z.string(),
	kind: z.literal("form"),
	exportedAt: z.string(),
});

export const formExportFormSchema = z.object({
	name: z.string().min(1).max(200),
	nameEs: z.string().max(200).optional(),
	description: z.string().max(2000).default(""),
	descriptionEs: z.string().max(2000).optional(),
	tags: z.array(z.string()).default([]),
});

export const formExportSchema = z.object({
	metadata: formExportMetadataSchema,
	form: formExportFormSchema,
	fields: z.array(formFieldSchema),
});

export type FormExport = z.infer<typeof formExportSchema>;
export type FormExportField = z.infer<typeof formFieldSchema>;
