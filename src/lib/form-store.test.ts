import { describe, it, expect, beforeEach } from "vitest";
import { useFormStore } from "./form-store";

describe("useFormStore", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		useFormStore.setState({
			forms: [],
			selectedForm: null,
			selectedVersion: null,
			isEditing: false,
			editingFields: [],
		});
	});

	describe("createForm", () => {
		it("should create a new form with initial version", () => {
			const { createForm, forms } = useFormStore.getState();

			createForm("Test Form", "Test description");

			const state = useFormStore.getState();
			expect(state.forms).toHaveLength(1);
			expect(state.forms[0].name).toBe("Test Form");
			expect(state.forms[0].description).toBe("Test description");
			expect(state.forms[0].status).toBe("draft");
			expect(state.forms[0].currentVersion).toBe(1);
			expect(state.forms[0].versions).toHaveLength(1);
		});

		it("should add new form at the beginning of the list", () => {
			const { createForm } = useFormStore.getState();

			createForm("First Form", "First description");
			createForm("Second Form", "Second description");

			const state = useFormStore.getState();
			expect(state.forms[0].name).toBe("Second Form");
			expect(state.forms[1].name).toBe("First Form");
		});
	});

	describe("setSelectedForm", () => {
		it("should select a form by id", () => {
			useFormStore.setState({
				forms: [
					{
						id: "1",
						name: "Test Form",
						description: "Test",
						status: "draft",
						currentVersion: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						tags: [],
						versions: [
							{
								id: "v1",
								version: 1,
								createdAt: new Date().toISOString(),
								createdBy: "Test User",
								fields: [],
								schema: { input: {}, output: {} },
							},
						],
					},
				],
			});

			const { setSelectedForm } = useFormStore.getState();
			setSelectedForm("1");

			const state = useFormStore.getState();
			expect(state.selectedForm).not.toBeNull();
			expect(state.selectedForm?.id).toBe("1");
			expect(state.selectedVersion?.version).toBe(1);
		});

		it("should clear selection when passed null", () => {
			const { setSelectedForm } = useFormStore.getState();
			setSelectedForm(null);

			const state = useFormStore.getState();
			expect(state.selectedForm).toBeNull();
			expect(state.selectedVersion).toBeNull();
		});
	});

	describe("deleteForm", () => {
		it("should remove a form from the list", () => {
			useFormStore.setState({
				forms: [
					{
						id: "1",
						name: "Test Form",
						description: "Test",
						status: "draft",
						currentVersion: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						tags: [],
						versions: [],
					},
				],
			});

			const { deleteForm } = useFormStore.getState();
			deleteForm("1");

			const state = useFormStore.getState();
			expect(state.forms).toHaveLength(0);
		});
	});

	describe("updateForm", () => {
		it("should update form properties", () => {
			useFormStore.setState({
				forms: [
					{
						id: "1",
						name: "Test Form",
						description: "Test",
						status: "draft",
						currentVersion: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						tags: [],
						versions: [],
					},
				],
			});

			const { updateForm } = useFormStore.getState();
			updateForm("1", { name: "Updated Form", status: "published" });

			const state = useFormStore.getState();
			expect(state.forms[0].name).toBe("Updated Form");
			expect(state.forms[0].status).toBe("published");
		});
	});

	describe("startEditing", () => {
		it("should set editing state with form fields", () => {
			const testForm = {
				id: "1",
				name: "Test Form",
				description: "Test",
				status: "draft" as const,
				currentVersion: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				tags: [],
				versions: [
					{
						id: "v1",
						version: 1,
						createdAt: new Date().toISOString(),
						createdBy: "Test User",
						fields: [
							{
								id: "f1",
								type: "text" as const,
								label: "Test Field",
								required: true,
							},
						],
						schema: { input: {}, output: {} },
					},
				],
			};

			const { startEditing } = useFormStore.getState();
			startEditing(testForm);

			const state = useFormStore.getState();
			expect(state.isEditing).toBe(true);
			expect(state.editingFields).toHaveLength(1);
			expect(state.editingFields[0].label).toBe("Test Field");
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

			const { cancelEditing } = useFormStore.getState();
			cancelEditing();

			const state = useFormStore.getState();
			expect(state.isEditing).toBe(false);
			expect(state.editingFields).toHaveLength(0);
		});
	});

	describe("addField", () => {
		it("should add a field to editing fields", () => {
			useFormStore.setState({ editingFields: [] });

			const { addField } = useFormStore.getState();
			addField({ id: "f1", type: "text", label: "New Field", required: false });

			const state = useFormStore.getState();
			expect(state.editingFields).toHaveLength(1);
			expect(state.editingFields[0].label).toBe("New Field");
		});
	});

	describe("updateField", () => {
		it("should update a specific field", () => {
			useFormStore.setState({
				editingFields: [
					{ id: "f1", type: "text", label: "Original", required: false },
				],
			});

			const { updateField } = useFormStore.getState();
			updateField("f1", { label: "Updated" });

			const state = useFormStore.getState();
			expect(state.editingFields[0].label).toBe("Updated");
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

			const { deleteField } = useFormStore.getState();
			deleteField("f1");

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

			const { reorderFields } = useFormStore.getState();
			reorderFields(0, 2); // Move first to last

			const state = useFormStore.getState();
			expect(state.editingFields[0].id).toBe("f2");
			expect(state.editingFields[1].id).toBe("f3");
			expect(state.editingFields[2].id).toBe("f1");
		});
	});

	describe("saveFormVersion", () => {
		it("should create a new version of the form", () => {
			useFormStore.setState({
				forms: [
					{
						id: "1",
						name: "Test Form",
						description: "Test",
						status: "draft",
						currentVersion: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						tags: [],
						versions: [
							{
								id: "v1",
								version: 1,
								createdAt: new Date().toISOString(),
								createdBy: "Test User",
								fields: [],
								schema: { input: {}, output: {} },
							},
						],
					},
				],
				editingFields: [
					{ id: "f1", type: "text", label: "New Field", required: true },
				],
			});

			const { saveFormVersion } = useFormStore.getState();
			const fields = useFormStore.getState().editingFields;
			saveFormVersion("1", fields, "Added new field");

			const state = useFormStore.getState();
			expect(state.forms[0].currentVersion).toBe(2);
			expect(state.forms[0].versions).toHaveLength(2);
			expect(state.forms[0].versions[1].changelog).toBe("Added new field");
			expect(state.forms[0].versions[1].fields).toHaveLength(1);
			expect(state.isEditing).toBe(false);
		});

		it("should not save version if form not found", () => {
			useFormStore.setState({
				forms: [],
				editingFields: [
					{ id: "f1", type: "text", label: "New Field", required: true },
				],
			});

			const { saveFormVersion } = useFormStore.getState();
			const fields = useFormStore.getState().editingFields;
			saveFormVersion("nonexistent", fields, "Test");

			const state = useFormStore.getState();
			expect(state.forms).toHaveLength(0);
		});
	});

	describe("setSelectedVersion", () => {
		it("should set selected version by id", () => {
			const version1 = {
				id: "v1",
				version: 1,
				createdAt: new Date().toISOString(),
				createdBy: "User",
				fields: [],
				schema: { input: {}, output: {} },
			};
			const version2 = {
				id: "v2",
				version: 2,
				createdAt: new Date().toISOString(),
				createdBy: "User",
				fields: [],
				schema: { input: {}, output: {} },
			};

			useFormStore.setState({
				selectedForm: {
					id: "1",
					name: "Test",
					description: "",
					status: "draft",
					currentVersion: 2,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					tags: [],
					versions: [version1, version2],
				},
				selectedVersion: version2,
			});

			const { setSelectedVersion } = useFormStore.getState();
			setSelectedVersion("v1");

			expect(useFormStore.getState().selectedVersion?.version).toBe(1);
		});
	});

	describe("updateForm edge cases", () => {
		it("should not update if form not found", () => {
			useFormStore.setState({
				forms: [
					{
						id: "1",
						name: "Test",
						description: "",
						status: "draft",
						currentVersion: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						tags: [],
						versions: [],
					},
				],
			});

			const { updateForm } = useFormStore.getState();
			updateForm("nonexistent", { name: "Updated" });

			expect(useFormStore.getState().forms[0].name).toBe("Test");
		});
	});

	describe("deleteForm edge cases", () => {
		it("should handle deleting non-existent form gracefully", () => {
			useFormStore.setState({
				forms: [
					{
						id: "1",
						name: "Test",
						description: "",
						status: "draft",
						currentVersion: 1,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						tags: [],
						versions: [],
					},
				],
			});

			const { deleteForm } = useFormStore.getState();
			deleteForm("nonexistent");

			expect(useFormStore.getState().forms).toHaveLength(1);
		});
	});
});
