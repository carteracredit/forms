"use client";

import { create } from "zustand";
import type { Form, FormField, FormVersion } from "./types/form";
import { mockForms } from "./mock-data";

/**
 * Form store state and actions interface
 */
interface FormStore {
	/** All forms in the store */
	forms: Form[];
	/** Currently selected form */
	selectedForm: Form | null;
	/** Currently selected version of the selected form */
	selectedVersion: FormVersion | null;
	/** Whether the form is currently being edited */
	isEditing: boolean;
	/** Fields being edited (working copy) */
	editingFields: FormField[];

	// Selection actions
	/** Select a form by ID */
	setSelectedForm: (formId: string | null) => void;
	/** Select a specific version of the current form */
	setSelectedVersion: (versionId: string | null) => void;

	// Form CRUD actions
	/** Create a new form */
	createForm: (name: string, description: string) => void;
	/** Update an existing form's metadata */
	updateForm: (formId: string, updates: Partial<Form>) => void;
	/** Delete a form */
	deleteForm: (formId: string) => void;

	// Editing actions
	/** Start editing a form */
	startEditing: (form: Form, version?: FormVersion) => void;
	/** Cancel editing and discard changes */
	cancelEditing: () => void;
	/** Save the current editing state as a new version */
	saveFormVersion: (
		formId: string,
		fields: FormField[],
		changelog: string,
	) => void;
	/** Update the editing fields state */
	updateEditingFields: (fields: FormField[]) => void;

	// Field manipulation actions
	/** Add a new field to the editing fields */
	addField: (field: FormField) => void;
	/** Update a specific field in the editing fields */
	updateField: (fieldId: string, updates: Partial<FormField>) => void;
	/** Delete a field from the editing fields */
	deleteField: (fieldId: string) => void;
	/** Reorder fields by moving a field from one index to another */
	reorderFields: (startIndex: number, endIndex: number) => void;
}

/**
 * Zustand store for form management.
 *
 * This store handles:
 * - Form CRUD operations
 * - Form versioning
 * - Field editing and manipulation
 * - Selection state
 */
export const useFormStore = create<FormStore>((set, get) => ({
	forms: mockForms,
	selectedForm: null,
	selectedVersion: null,
	isEditing: false,
	editingFields: [],

	setSelectedForm: (formId) => {
		if (!formId) {
			set({ selectedForm: null, selectedVersion: null });
			return;
		}
		const form = get().forms.find((f) => f.id === formId);
		if (form) {
			const currentVersion = form.versions.find(
				(v) => v.version === form.currentVersion,
			);
			set({ selectedForm: form, selectedVersion: currentVersion });
		}
	},

	setSelectedVersion: (versionId) => {
		const form = get().selectedForm;
		if (!form || !versionId) return;

		const version = form.versions.find((v) => v.id === versionId);
		if (version) {
			set({ selectedVersion: version });
		}
	},

	createForm: (name, description) => {
		const newForm: Form = {
			id: Date.now().toString(),
			name,
			description,
			status: "draft",
			currentVersion: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			tags: [],
			versions: [
				{
					id: `v${Date.now()}-1`,
					version: 1,
					createdAt: new Date().toISOString(),
					createdBy: "Current User",
					changelog: "Initial form creation",
					fields: [],
					schema: { input: {}, output: {} },
				},
			],
		};
		set({ forms: [newForm, ...get().forms] });
	},

	updateForm: (formId, updates) => {
		set({
			forms: get().forms.map((f) =>
				f.id === formId
					? { ...f, ...updates, updatedAt: new Date().toISOString() }
					: f,
			),
		});
	},

	deleteForm: (formId) => {
		set({
			forms: get().forms.filter((f) => f.id !== formId),
			selectedForm: null,
			selectedVersion: null,
		});
	},

	startEditing: (form, version) => {
		const versionToEdit =
			version || form.versions.find((v) => v.version === form.currentVersion);
		if (versionToEdit) {
			set({
				isEditing: true,
				selectedForm: form,
				selectedVersion: versionToEdit,
				editingFields: JSON.parse(JSON.stringify(versionToEdit.fields)),
			});
		}
	},

	cancelEditing: () => {
		set({ isEditing: false, editingFields: [] });
	},

	saveFormVersion: (formId, fields, changelog) => {
		const form = get().forms.find((f) => f.id === formId);
		if (!form) return;

		const newVersion: FormVersion = {
			id: `v${Date.now()}-${form.currentVersion + 1}`,
			version: form.currentVersion + 1,
			createdAt: new Date().toISOString(),
			createdBy: "Current User",
			changelog: changelog || `Version ${form.currentVersion + 1}`,
			fields: JSON.parse(JSON.stringify(fields)),
			schema: {
				input: {},
				output: fields.reduce(
					(acc, field) => {
						acc[field.id] =
							field.type === "checkbox-group" ? "array" : "string";
						return acc;
					},
					{} as Record<string, string>,
				),
			},
		};

		set({
			forms: get().forms.map((f) =>
				f.id === formId
					? {
							...f,
							currentVersion: newVersion.version,
							versions: [...f.versions, newVersion],
							updatedAt: new Date().toISOString(),
						}
					: f,
			),
			isEditing: false,
			editingFields: [],
			selectedVersion: newVersion,
		});
	},

	updateEditingFields: (fields) => {
		set({ editingFields: fields });
	},

	addField: (field) => {
		set({ editingFields: [...get().editingFields, field] });
	},

	updateField: (fieldId, updates) => {
		set({
			editingFields: get().editingFields.map((f) =>
				f.id === fieldId ? { ...f, ...updates } : f,
			),
		});
	},

	deleteField: (fieldId) => {
		set({
			editingFields: get().editingFields.filter((f) => f.id !== fieldId),
		});
	},

	reorderFields: (startIndex, endIndex) => {
		const fields = [...get().editingFields];
		const [removed] = fields.splice(startIndex, 1);
		fields.splice(endIndex, 0, removed);
		set({ editingFields: fields });
	},
}));
