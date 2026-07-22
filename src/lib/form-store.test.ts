import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFormStore } from "./form-store";
import type { Form, FormVersion } from "./types/form";

// ---------------------------------------------------------------------------
// Mock server actions
// ---------------------------------------------------------------------------

vi.mock("./api/forms-actions", () => ({
	listFormsAction: vi.fn(),
	getFormAction: vi.fn(),
	createFormAction: vi.fn(),
	updateFormAction: vi.fn(),
	deleteFormAction: vi.fn(),
	publishFormAction: vi.fn(),
	archiveFormAction: vi.fn(),
	cloneFormAction: vi.fn(),
	saveFieldsDraftAction: vi.fn(),
	listFormVersionsAction: vi.fn(),
}));

import * as formsActions from "./api/forms-actions";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeVersion(overrides: Partial<FormVersion> = {}): FormVersion {
	return {
		id: "v1",
		version: 1,
		createdAt: new Date().toISOString(),
		createdBy: "Test User",
		fields: [],
		schema: { input: {}, output: {} },
		...overrides,
	};
}

function makeForm(overrides: Partial<Form> = {}): Form {
	return {
		id: "1",
		name: "Test Form",
		description: "Test description",
		status: "draft",
		currentVersion: 0,
		draftFields: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		tags: [],
		versions: [],
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useFormStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useFormStore.setState({
			forms: [],
			selectedForm: null,
			selectedVersion: null,
			isEditing: false,
			editingFields: [],
			isLoading: false,
			error: null,
		});
	});

	describe("fetchForms", () => {
		it("should load forms and clear loading state", async () => {
			const mockForms = [makeForm()];
			vi.mocked(formsActions.listFormsAction).mockResolvedValue(mockForms);

			await useFormStore.getState().fetchForms();

			const state = useFormStore.getState();
			expect(state.forms).toHaveLength(1);
			expect(state.isLoading).toBe(false);
			expect(state.error).toBeNull();
		});

		it("should set error state on failure", async () => {
			vi.mocked(formsActions.listFormsAction).mockRejectedValue(
				new Error("Network error"),
			);

			await useFormStore.getState().fetchForms();

			const state = useFormStore.getState();
			expect(state.isLoading).toBe(false);
			expect(state.error).toBe("Network error");
		});

		it("should use generic message for non-Error failures", async () => {
			vi.mocked(formsActions.listFormsAction).mockRejectedValue("string error");

			await useFormStore.getState().fetchForms();

			expect(useFormStore.getState().error).toBe("Failed to fetch forms");
		});
	});

	describe("createForm", () => {
		it("should create a new form and add it at the beginning", async () => {
			const existingForm = makeForm({ id: "existing", name: "Existing" });
			const newForm = makeForm({ id: "new", name: "New Form" });
			useFormStore.setState({ forms: [existingForm] });
			vi.mocked(formsActions.createFormAction).mockResolvedValue(newForm);

			await useFormStore
				.getState()
				.createForm({ name: "New Form", description: "Description" });

			const state = useFormStore.getState();
			expect(state.forms).toHaveLength(2);
			expect(state.forms[0].id).toBe("new");
			expect(state.isLoading).toBe(false);
		});

		it("should propagate ES fields to the action payload", async () => {
			const newForm = makeForm({ id: "new", name: "New Form" });
			vi.mocked(formsActions.createFormAction).mockResolvedValue(newForm);

			await useFormStore.getState().createForm({
				name: "New Form",
				nameEs: "Nuevo Formulario",
				description: "Desc",
				descriptionEs: "Desc ES",
			});

			expect(formsActions.createFormAction).toHaveBeenCalledWith({
				name: "New Form",
				name_es: "Nuevo Formulario",
				description: "Desc",
				description_es: "Desc ES",
			});
		});

		it("should throw and set error on failure", async () => {
			vi.mocked(formsActions.createFormAction).mockRejectedValue(
				new Error("Create failed"),
			);

			await expect(
				useFormStore
					.getState()
					.createForm({ name: "Test", description: "Desc" }),
			).rejects.toThrow("Create failed");

			expect(useFormStore.getState().error).toBe("Create failed");
		});

		it("should use generic message for non-Error failures", async () => {
			vi.mocked(formsActions.createFormAction).mockRejectedValue(
				"string error",
			);

			await expect(
				useFormStore
					.getState()
					.createForm({ name: "Test", description: "Desc" }),
			).rejects.toBe("string error");

			expect(useFormStore.getState().error).toBe("Failed to create form");
		});
	});

	describe("refreshForm", () => {
		it("should refresh a form in the list", async () => {
			const form = makeForm();
			const refreshed = { ...form, name: "Refreshed Form" };
			useFormStore.setState({ forms: [form], selectedForm: form });
			vi.mocked(formsActions.getFormAction).mockResolvedValue(refreshed);

			await useFormStore.getState().refreshForm("1");

			const state = useFormStore.getState();
			expect(state.forms[0].name).toBe("Refreshed Form");
			expect(state.selectedForm?.name).toBe("Refreshed Form");
		});

		it("should not update selectedForm if a different form is selected", async () => {
			const form = makeForm();
			const otherForm = makeForm({ id: "other", name: "Other Form" });
			const refreshed = { ...form, name: "Refreshed Form" };
			useFormStore.setState({ forms: [form], selectedForm: otherForm });
			vi.mocked(formsActions.getFormAction).mockResolvedValue(refreshed);

			await useFormStore.getState().refreshForm("1");

			expect(useFormStore.getState().selectedForm?.id).toBe("other");
		});

		it("should set error on failure", async () => {
			vi.mocked(formsActions.getFormAction).mockRejectedValue(
				new Error("Refresh failed"),
			);

			await useFormStore.getState().refreshForm("1");

			expect(useFormStore.getState().error).toBe("Refresh failed");
		});

		it("should use generic message for non-Error failures", async () => {
			vi.mocked(formsActions.getFormAction).mockRejectedValue("string error");

			await useFormStore.getState().refreshForm("1");

			expect(useFormStore.getState().error).toBe("Failed to refresh form");
		});
	});

	describe("setSelectedForm", () => {
		it("should select a form by id and set its latest published version", () => {
			const version1 = makeVersion({ id: "v1", version: 1 });
			const version2 = makeVersion({ id: "v2", version: 2 });
			const form = makeForm({
				currentVersion: 2,
				versions: [version1, version2],
			});
			useFormStore.setState({ forms: [form] });

			useFormStore.getState().setSelectedForm("1");

			const state = useFormStore.getState();
			expect(state.selectedForm?.id).toBe("1");
			expect(state.selectedVersion?.version).toBe(2);
		});

		it("should set selectedVersion to null when form has no published versions", () => {
			const form = makeForm({ currentVersion: 0, versions: [] });
			useFormStore.setState({ forms: [form] });

			useFormStore.getState().setSelectedForm("1");

			const state = useFormStore.getState();
			expect(state.selectedForm?.id).toBe("1");
			expect(state.selectedVersion).toBeNull();
		});

		it("should clear selection when passed null", () => {
			useFormStore.getState().setSelectedForm(null);

			const state = useFormStore.getState();
			expect(state.selectedForm).toBeNull();
			expect(state.selectedVersion).toBeNull();
		});

		it("should do nothing when form id is not found", () => {
			useFormStore.setState({ forms: [], selectedForm: null });
			useFormStore.getState().setSelectedForm("nonexistent");
			expect(useFormStore.getState().selectedForm).toBeNull();
		});
	});

	describe("deleteForm", () => {
		it("should remove a form from the list", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form] });
			vi.mocked(formsActions.deleteFormAction).mockResolvedValue(undefined);

			await useFormStore.getState().deleteForm("1");

			expect(useFormStore.getState().forms).toHaveLength(0);
		});

		it("should clear selection if the deleted form was selected", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form], selectedForm: form });
			vi.mocked(formsActions.deleteFormAction).mockResolvedValue(undefined);

			await useFormStore.getState().deleteForm("1");

			expect(useFormStore.getState().selectedForm).toBeNull();
		});

		it("should throw and set error on failure", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form] });
			vi.mocked(formsActions.deleteFormAction).mockRejectedValue(
				new Error("Delete failed"),
			);

			await expect(useFormStore.getState().deleteForm("1")).rejects.toThrow(
				"Delete failed",
			);

			expect(useFormStore.getState().error).toBe("Delete failed");
		});

		it("should use generic message for non-Error failures", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form] });
			vi.mocked(formsActions.deleteFormAction).mockRejectedValue(
				"string error",
			);

			await expect(useFormStore.getState().deleteForm("1")).rejects.toBe(
				"string error",
			);

			expect(useFormStore.getState().error).toBe("Failed to delete form");
		});
	});

	describe("updateForm", () => {
		it("should update form in list and selectedForm", async () => {
			const form = makeForm();
			const updated = { ...form, name: "Updated Form" };
			useFormStore.setState({ forms: [form], selectedForm: form });
			vi.mocked(formsActions.updateFormAction).mockResolvedValue(updated);

			await useFormStore.getState().updateForm("1", { name: "Updated Form" });

			const state = useFormStore.getState();
			expect(state.forms[0].name).toBe("Updated Form");
			expect(state.selectedForm?.name).toBe("Updated Form");
		});

		it("should not update selectedForm if a different form is selected", async () => {
			const form = makeForm();
			const otherForm = makeForm({ id: "other" });
			const updated = { ...form, name: "Updated Form" };
			useFormStore.setState({ forms: [form], selectedForm: otherForm });
			vi.mocked(formsActions.updateFormAction).mockResolvedValue(updated);

			await useFormStore.getState().updateForm("1", { name: "Updated Form" });

			expect(useFormStore.getState().selectedForm?.id).toBe("other");
		});

		it("should throw and set error on failure", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form] });
			vi.mocked(formsActions.updateFormAction).mockRejectedValue(
				new Error("Update failed"),
			);

			await expect(
				useFormStore.getState().updateForm("1", { name: "X" }),
			).rejects.toThrow("Update failed");

			expect(useFormStore.getState().error).toBe("Update failed");
		});

		it("should use generic message for non-Error failures", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form] });
			vi.mocked(formsActions.updateFormAction).mockRejectedValue(
				"string error",
			);

			await expect(
				useFormStore.getState().updateForm("1", { name: "X" }),
			).rejects.toBe("string error");

			expect(useFormStore.getState().error).toBe("Failed to update form");
		});
	});

	describe("publishForm", () => {
		it("should update form status to published", async () => {
			const form = makeForm();
			const published = { ...form, status: "published" as const };
			useFormStore.setState({ forms: [form], selectedForm: form });
			vi.mocked(formsActions.publishFormAction).mockResolvedValue(published);

			await useFormStore.getState().publishForm("1");

			expect(useFormStore.getState().forms[0].status).toBe("published");
		});

		it("should not update selectedForm if a different form is selected", async () => {
			const form = makeForm();
			const otherForm = makeForm({ id: "other" });
			const published = { ...form, status: "published" as const };
			useFormStore.setState({ forms: [form], selectedForm: otherForm });
			vi.mocked(formsActions.publishFormAction).mockResolvedValue(published);

			await useFormStore.getState().publishForm("1");

			expect(useFormStore.getState().selectedForm?.id).toBe("other");
		});

		it("should set error on failure", async () => {
			vi.mocked(formsActions.publishFormAction).mockRejectedValue(
				new Error("Publish failed"),
			);

			await expect(useFormStore.getState().publishForm("1")).rejects.toThrow(
				"Publish failed",
			);

			expect(useFormStore.getState().error).toBe("Publish failed");
		});

		it("should use generic message for non-Error failures", async () => {
			vi.mocked(formsActions.publishFormAction).mockRejectedValue(
				"string error",
			);

			await expect(useFormStore.getState().publishForm("1")).rejects.toBe(
				"string error",
			);

			expect(useFormStore.getState().error).toBe("Failed to publish form");
		});
	});

	describe("archiveForm", () => {
		it("should update form status to archived", async () => {
			const form = makeForm({ status: "published" });
			const archived = { ...form, status: "archived" as const };
			useFormStore.setState({ forms: [form], selectedForm: form });
			vi.mocked(formsActions.archiveFormAction).mockResolvedValue(archived);

			await useFormStore.getState().archiveForm("1");

			expect(useFormStore.getState().forms[0].status).toBe("archived");
		});

		it("should not update selectedForm if a different form is selected", async () => {
			const form = makeForm({ status: "published" });
			const otherForm = makeForm({ id: "other" });
			const archived = { ...form, status: "archived" as const };
			useFormStore.setState({ forms: [form], selectedForm: otherForm });
			vi.mocked(formsActions.archiveFormAction).mockResolvedValue(archived);

			await useFormStore.getState().archiveForm("1");

			expect(useFormStore.getState().selectedForm?.id).toBe("other");
		});

		it("should set error on failure", async () => {
			vi.mocked(formsActions.archiveFormAction).mockRejectedValue(
				new Error("Archive failed"),
			);

			await expect(useFormStore.getState().archiveForm("1")).rejects.toThrow(
				"Archive failed",
			);

			expect(useFormStore.getState().error).toBe("Archive failed");
		});

		it("should use generic message for non-Error failures", async () => {
			vi.mocked(formsActions.archiveFormAction).mockRejectedValue(
				"string error",
			);

			await expect(useFormStore.getState().archiveForm("1")).rejects.toBe(
				"string error",
			);

			expect(useFormStore.getState().error).toBe("Failed to archive form");
		});
	});

	describe("cloneForm", () => {
		it("should prepend the cloned form to the list", async () => {
			const existing = makeForm({ id: "existing" });
			const cloned = makeForm({ id: "cloned", name: "Copy of Test Form" });
			useFormStore.setState({ forms: [existing] });
			vi.mocked(formsActions.cloneFormAction).mockResolvedValue(cloned);

			const result = await useFormStore.getState().cloneForm("existing");

			const state = useFormStore.getState();
			expect(state.forms).toHaveLength(2);
			expect(state.forms[0].id).toBe("cloned");
			expect(state.forms[1].id).toBe("existing");
			expect(result.id).toBe("cloned");
		});

		it("should throw and set error on failure", async () => {
			vi.mocked(formsActions.cloneFormAction).mockRejectedValue(
				new Error("Clone failed"),
			);

			await expect(useFormStore.getState().cloneForm("form-1")).rejects.toThrow(
				"Clone failed",
			);

			expect(useFormStore.getState().error).toBe("Clone failed");
		});

		it("should use generic message for non-Error failures", async () => {
			vi.mocked(formsActions.cloneFormAction).mockRejectedValue("string error");

			await expect(useFormStore.getState().cloneForm("form-1")).rejects.toBe(
				"string error",
			);

			expect(useFormStore.getState().error).toBe("Failed to clone form");
		});
	});

	describe("startEditing", () => {
		it("should set editing state with draft fields", () => {
			const form = makeForm({
				draftFields: [
					{ id: "f1", type: "text", label: "Test Field", required: true },
				],
			});

			useFormStore.getState().startEditing(form);

			const state = useFormStore.getState();
			expect(state.isEditing).toBe(true);
			expect(state.editingFields).toHaveLength(1);
			expect(state.editingFields[0].label).toBe("Test Field");
		});

		it("should set editing state with empty fields when draft is empty", () => {
			const form = makeForm({ draftFields: [] });

			useFormStore.getState().startEditing(form);

			const state = useFormStore.getState();
			expect(state.isEditing).toBe(true);
			expect(state.editingFields).toHaveLength(0);
		});
	});

	describe("cancelEditing", () => {
		it("should clear editing state", () => {
			useFormStore.setState({
				isEditing: true,
				editingFields: [
					{ id: "f1", type: "text", label: "Test", required: true },
				],
			});

			useFormStore.getState().cancelEditing();

			const state = useFormStore.getState();
			expect(state.isEditing).toBe(false);
			expect(state.editingFields).toHaveLength(0);
		});
	});

	describe("addField", () => {
		it("should add a field to editing fields", () => {
			useFormStore.setState({ editingFields: [] });

			useFormStore.getState().addField({
				id: "f1",
				type: "text",
				label: "New Field",
				required: false,
			});

			const state = useFormStore.getState();
			expect(state.editingFields).toHaveLength(1);
			expect(state.editingFields[0].label).toBe("New Field");
		});
	});

	describe("updateEditingFields", () => {
		it("should replace editing fields", () => {
			useFormStore.setState({
				editingFields: [
					{ id: "f1", type: "text", label: "Old", required: false },
				],
			});

			const newFields = [
				{ id: "f2", type: "email" as const, label: "New", required: true },
			];
			useFormStore.getState().updateEditingFields(newFields);

			expect(useFormStore.getState().editingFields).toHaveLength(1);
			expect(useFormStore.getState().editingFields[0].id).toBe("f2");
		});
	});

	describe("updateField", () => {
		it("should update a specific field", () => {
			useFormStore.setState({
				editingFields: [
					{ id: "f1", type: "text", label: "Original", required: false },
				],
			});

			useFormStore.getState().updateField("f1", { label: "Updated" });

			expect(useFormStore.getState().editingFields[0].label).toBe("Updated");
		});
	});

	describe("deleteField", () => {
		it("should remove a field from editing fields", () => {
			useFormStore.setState({
				editingFields: [
					{ id: "f1", type: "text", label: "Field 1", required: false },
					{ id: "f2", type: "email", label: "Field 2", required: true },
				],
			});

			useFormStore.getState().deleteField("f1");

			const state = useFormStore.getState();
			expect(state.editingFields).toHaveLength(1);
			expect(state.editingFields[0].id).toBe("f2");
		});
	});

	describe("reorderFields", () => {
		it("should reorder fields correctly", () => {
			useFormStore.setState({
				editingFields: [
					{ id: "f1", type: "text", label: "First", required: false },
					{ id: "f2", type: "email", label: "Second", required: false },
					{ id: "f3", type: "phone", label: "Third", required: false },
				],
			});

			useFormStore.getState().reorderFields(0, 2);

			const state = useFormStore.getState();
			expect(state.editingFields[0].id).toBe("f2");
			expect(state.editingFields[1].id).toBe("f3");
			expect(state.editingFields[2].id).toBe("f1");
		});
	});

	describe("saveFieldsDraft", () => {
		it("should save draft fields and update store", async () => {
			const form = makeForm();
			const updatedForm = makeForm({
				draftFields: [
					{ id: "f1", type: "text", label: "Field 1", required: false },
				],
			});
			useFormStore.setState({ forms: [form], selectedForm: form });
			vi.mocked(formsActions.saveFieldsDraftAction).mockResolvedValue(
				updatedForm,
			);

			await useFormStore
				.getState()
				.saveFieldsDraft("1", updatedForm.draftFields);

			const state = useFormStore.getState();
			expect(state.selectedForm?.draftFields).toHaveLength(1);
			expect(state.editingFields).toHaveLength(1);
		});

		it("should not update selectedForm if a different form is selected", async () => {
			const form = makeForm();
			const otherForm = makeForm({ id: "other" });
			const updatedForm = makeForm({ draftFields: [] });
			useFormStore.setState({ forms: [form], selectedForm: otherForm });
			vi.mocked(formsActions.saveFieldsDraftAction).mockResolvedValue(
				updatedForm,
			);

			await useFormStore.getState().saveFieldsDraft("1", []);

			expect(useFormStore.getState().selectedForm?.id).toBe("other");
		});

		it("should throw and set error on failure", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form] });
			vi.mocked(formsActions.saveFieldsDraftAction).mockRejectedValue(
				new Error("Save failed"),
			);

			await expect(
				useFormStore.getState().saveFieldsDraft("1", []),
			).rejects.toThrow("Save failed");

			expect(useFormStore.getState().error).toBe("Save failed");
		});

		it("should use generic message for non-Error failures", async () => {
			const form = makeForm();
			useFormStore.setState({ forms: [form] });
			vi.mocked(formsActions.saveFieldsDraftAction).mockRejectedValue(
				"string error",
			);

			await expect(
				useFormStore.getState().saveFieldsDraft("1", []),
			).rejects.toBe("string error");

			expect(useFormStore.getState().error).toBe("Failed to save draft");
		});
	});

	describe("setSelectedVersion", () => {
		it("should set selected version by id", () => {
			const version1 = makeVersion({ id: "v1", version: 1 });
			const version2 = makeVersion({ id: "v2", version: 2 });
			const form = makeForm({
				currentVersion: 2,
				versions: [version1, version2],
			});
			useFormStore.setState({ selectedForm: form, selectedVersion: version2 });

			useFormStore.getState().setSelectedVersion("v1");

			expect(useFormStore.getState().selectedVersion?.version).toBe(1);
		});

		it("should do nothing when there is no selected form", () => {
			useFormStore.setState({ selectedForm: null, selectedVersion: null });

			useFormStore.getState().setSelectedVersion("v1");

			expect(useFormStore.getState().selectedVersion).toBeNull();
		});

		it("should do nothing when versionId is null", () => {
			const form = makeForm();
			const version = makeVersion();
			useFormStore.setState({ selectedForm: form, selectedVersion: version });

			useFormStore.getState().setSelectedVersion(null);

			expect(useFormStore.getState().selectedVersion).toBe(version);
		});

		it("should do nothing when version is not found", () => {
			const form = makeForm();
			const version = makeVersion();
			useFormStore.setState({ selectedForm: form, selectedVersion: version });

			useFormStore.getState().setSelectedVersion("nonexistent");

			expect(useFormStore.getState().selectedVersion).toBe(version);
		});
	});
});
