/**
 * Form type definitions for the Forms application
 *
 * These types define the structure of forms, form fields, versions,
 * and schemas used throughout the form builder.
 */

/**
 * Supported form field types
 */
export type FormFieldType =
	| "name"
	| "phone"
	| "email"
	| "text"
	| "textarea"
	| "address"
	| "file"
	| "checkbox"
	| "radio"
	| "checkbox-group"
	| "dropdown"
	| "date"
	| "datetime"
	| "time"
	| "number"
	| "url"
	| "password"
	| "rating";

/**
 * Form field definition
 */
export interface FormField {
	/** Unique identifier for the field */
	id: string;
	/** Type of field */
	type: FormFieldType;
	/** Display label in English */
	label: string;
	/** Display label in Spanish (optional) */
	labelEs?: string;
	/** Placeholder text in English (optional) */
	placeholder?: string;
	/** Placeholder text in Spanish (optional) */
	placeholderEs?: string;
	/** Whether the field is required */
	required: boolean;
	/** Options for select/radio/checkbox-group fields */
	options?: string[];
	/** Validation rules */
	validation?: {
		min?: number;
		max?: number;
		pattern?: string;
		minLength?: number;
		maxLength?: number;
		step?: number;
	};
	/** Additional field-specific properties */
	properties?: {
		/** Number of rows for textarea */
		rows?: number;
		/** Max rating for rating field */
		maxRating?: number;
		/** Allow half stars for rating field */
		allowHalf?: boolean;
		/** Show strength indicator for password field */
		showStrength?: boolean;
		/** Accepted file types for file upload */
		acceptedTypes?: string[];
		/** Max file size in MB for file upload */
		maxFileSize?: number;
		/** Enable Google Places autocomplete for address */
		enableAutocomplete?: boolean;
		/** Minimum date (ISO string) for date/datetime fields */
		dateMin?: string;
		/** Maximum date (ISO string) for date/datetime fields */
		dateMax?: string;
	};
}

/**
 * Form input/output schema definition
 */
export interface FormSchema {
	/** Schema for pre-fill data from workflow */
	input: Record<string, unknown>;
	/** Schema for form submission data */
	output: Record<string, unknown>;
}

/**
 * Form version definition
 */
export interface FormVersion {
	/** Unique identifier for the version */
	id: string;
	/** Version number */
	version: number;
	/** Creation timestamp */
	createdAt: string;
	/** User who created this version */
	createdBy: string;
	/** Description of changes in this version */
	changelog?: string;
	/** Fields in this version */
	fields: FormField[];
	/** Input/output schema for this version */
	schema: FormSchema;
}

/**
 * Form status
 */
export type FormStatus = "draft" | "published" | "archived";

/**
 * Complete form definition
 */
export interface Form {
	/** Unique identifier for the form */
	id: string;
	/** Form name in English */
	name: string;
	/** Form name in Spanish (optional) */
	nameEs?: string;
	/** Form description in English */
	description: string;
	/** Form description in Spanish (optional) */
	descriptionEs?: string;
	/** Current status of the form */
	status: FormStatus;
	/** Current active version number */
	currentVersion: number;
	/** All versions of the form */
	versions: FormVersion[];
	/** Creation timestamp */
	createdAt: string;
	/** Last update timestamp */
	updatedAt: string;
	/** Tags for categorization */
	tags: string[];
}

/**
 * Helper function to get the current version of a form
 */
export function getCurrentVersion(form: Form): FormVersion | undefined {
	return form.versions.find((v) => v.version === form.currentVersion);
}

/**
 * Helper function to get fields from the current version
 */
export function getCurrentFields(form: Form): FormField[] {
	const version = getCurrentVersion(form);
	return version?.fields ?? [];
}

/**
 * Helper function to get schema from the current version
 */
export function getCurrentSchema(form: Form): FormSchema | undefined {
	const version = getCurrentVersion(form);
	return version?.schema;
}
