"use client";

import { create } from "zustand";
import type { Form, FormField, FormVersion } from "./types/form";
import {
	listFormsAction,
	getFormAction,
	createFormAction,
	updateFormAction,
	deleteFormAction,
	publishFormAction,
	archiveFormAction,
	saveFieldsDraftAction,
} from "./api/forms-actions";
import type { ListFormsOptions } from "./api/forms";

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

	/** Loading state for async operations */
	isLoading: boolean;
	/** Error state for async operations */
	error: string | null;

	// Data fetching
	/** Fetch all forms from the API */
	fetchForms: (options?: ListFormsOptions) => Promise<void>;
	/** Refresh a single form by ID from the API */
	refreshForm: (formId: string) => Promise<void>;

	// Selection actions
	/** Select a form by ID */
	setSelectedForm: (formId: string | null) => void;
	/** Select a specific version of the current form */
	setSelectedVersion: (versionId: string | null) => void;

	// Form CRUD actions
	/** Create a new form */
	createForm: (
		name: string,
		description: string,
		options?: { jwt?: string },
	) => Promise<Form>;
	/** Update an existing form's metadata */
	updateForm: (
		formId: string,
		updates: Partial<
			Pick<Form, "name" | "nameEs" | "description" | "descriptionEs" | "tags">
		>,
		options?: { jwt?: string },
	) => Promise<void>;
	/** Delete a form */
	deleteForm: (formId: string, options?: { jwt?: string }) => Promise<void>;
	/** Publish a form */
	publishForm: (formId: string, options?: { jwt?: string }) => Promise<void>;
	/** Archive a form */
	archiveForm: (formId: string, options?: { jwt?: string }) => Promise<void>;

	// Editing actions
	/** Start editing a form */
	startEditing: (form: Form) => void;
	/** Cancel editing and discard changes */
	cancelEditing: () => void;
	/** Save current editing fields as draft (no version created). */
	saveFieldsDraft: (formId: string, fields: FormField[]) => Promise<void>;
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
 * All CRUD operations are async and backed by the workflow-svc API.
 * Local state is kept in sync after each successful API call.
 */
export const useFormStore = create<FormStore>((set, get) => ({
	forms: [],
	selectedForm: null,
	selectedVersion: null,
	isEditing: false,
	editingFields: [],
	isLoading: false,
	error: null,

	fetchForms: async (options) => {
		set({ isLoading: true, error: null });
		try {
			const forms = await listFormsAction(options);
			set({ forms, isLoading: false });
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch forms";
			set({ isLoading: false, error: message });
		}
	},

	refreshForm: async (formId) => {
		try {
			const form = await getFormAction(formId);
			const current = get();
			set({
				forms: current.forms.map((f) => (f.id === formId ? form : f)),
				selectedForm:
					current.selectedForm?.id === formId ? form : current.selectedForm,
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to refresh form";
			set({ error: message });
		}
	},

	setSelectedForm: (formId) => {
		if (!formId) {
			set({ selectedForm: null, selectedVersion: null });
			return;
		}
		const form = get().forms.find((f) => f.id === formId);
		if (form) {
			// Select the latest published version (highest version number)
			const latestVersion =
				form.versions.length > 0
					? form.versions.reduce((a, b) => (a.version > b.version ? a : b))
					: null;
			set({ selectedForm: form, selectedVersion: latestVersion });
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

	createForm: async (name, description, options) => {
		set({ isLoading: true, error: null });
		try {
			const newForm = await createFormAction({ name, description });
			set({ forms: [newForm, ...get().forms], isLoading: false });
			return newForm;
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to create form";
			set({ isLoading: false, error: message });
			throw err;
		}
	},

	updateForm: async (formId, updates, options) => {
		try {
			const updatedForm = await updateFormAction(formId, {
				name: updates.name,
				name_es: updates.nameEs,
				description: updates.description,
				description_es: updates.descriptionEs,
				tags: updates.tags,
			});
			const current = get();
			set({
				forms: current.forms.map((f) => (f.id === formId ? updatedForm : f)),
				selectedForm:
					current.selectedForm?.id === formId
						? updatedForm
						: current.selectedForm,
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to update form";
			set({ error: message });
			throw err;
		}
	},

	deleteForm: async (formId, options) => {
		try {
			await deleteFormAction(formId);
			const current = get();
			set({
				forms: current.forms.filter((f) => f.id !== formId),
				selectedForm:
					current.selectedForm?.id === formId ? null : current.selectedForm,
				selectedVersion:
					current.selectedForm?.id === formId ? null : current.selectedVersion,
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to delete form";
			set({ error: message });
			throw err;
		}
	},

	publishForm: async (formId, options) => {
		try {
			const updatedForm = await publishFormAction(formId);
			// Latest published version
			const latestVersion =
				updatedForm.versions.length > 0
					? updatedForm.versions.reduce((a, b) =>
							a.version > b.version ? a : b,
						)
					: null;
			const current = get();
			set({
				forms: current.forms.map((f) => (f.id === formId ? updatedForm : f)),
				selectedForm:
					current.selectedForm?.id === formId
						? updatedForm
						: current.selectedForm,
				selectedVersion:
					current.selectedForm?.id === formId
						? latestVersion
						: current.selectedVersion,
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to publish form";
			set({ error: message });
			throw err;
		}
	},

	archiveForm: async (formId, options) => {
		try {
			const updatedForm = await archiveFormAction(formId);
			const current = get();
			set({
				forms: current.forms.map((f) => (f.id === formId ? updatedForm : f)),
				selectedForm:
					current.selectedForm?.id === formId
						? updatedForm
						: current.selectedForm,
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to archive form";
			set({ error: message });
			throw err;
		}
	},

	startEditing: (form) => {
		set({
			isEditing: true,
			selectedForm: form,
			// Initialize editing from draft fields, not a version
			editingFields: JSON.parse(JSON.stringify(form.draftFields)),
		});
	},

	cancelEditing: () => {
		set({ isEditing: false, editingFields: [] });
	},

	saveFieldsDraft: async (formId, fields) => {
		try {
			const updatedForm = await saveFieldsDraftAction(formId, { fields });
			const current = get();
			set({
				forms: current.forms.map((f) => (f.id === formId ? updatedForm : f)),
				selectedForm:
					current.selectedForm?.id === formId
						? updatedForm
						: current.selectedForm,
				editingFields: fields,
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to save draft";
			set({ error: message });
			throw err;
		}
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
