import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	listForms,
	getForm,
	createForm,
	updateForm,
	deleteForm,
	publishForm,
	archiveForm,
	listFormVersions,
	createFormVersion,
	apiFormToForm,
	apiFormSummaryToForm,
} from "./forms";
import type { ApiForm, ApiFormSummary, ApiFormVersion } from "./forms";

// ---------------------------------------------------------------------------
// Mock fetchJson and getWorkflowServiceUrl
// ---------------------------------------------------------------------------

vi.mock("./http", () => ({
	fetchJson: vi.fn(),
}));

vi.mock("./config", () => ({
	getWorkflowServiceUrl: () => "https://workflow-svc.test",
}));

import { fetchJson } from "./http";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeApiVersion(
	overrides: Partial<ApiFormVersion> = {},
): ApiFormVersion {
	return {
		id: "v1",
		form_id: "form-1",
		version: 1,
		fields: [],
		schema: { input: {}, output: {} },
		changelog: null,
		created_by: "user-1",
		created_at: "2024-01-01T00:00:00Z",
		...overrides,
	};
}

function makeApiForm(overrides: Partial<ApiForm> = {}): ApiForm {
	return {
		id: "form-1",
		name: "Test Form",
		name_es: null,
		description: "A test form",
		description_es: null,
		status: "draft",
		current_version: 1,
		tags: ["tag1"],
		created_at: "2024-01-01T00:00:00Z",
		updated_at: "2024-01-01T00:00:00Z",
		versions: [makeApiVersion()],
		...overrides,
	};
}

function makeApiFormSummary(
	overrides: Partial<ApiFormSummary> = {},
): ApiFormSummary {
	return {
		id: "form-1",
		name: "Test Form",
		name_es: null,
		description: "A test form",
		description_es: null,
		status: "draft",
		current_version: 1,
		tags: ["tag1"],
		created_at: "2024-01-01T00:00:00Z",
		updated_at: "2024-01-01T00:00:00Z",
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("forms API client", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("apiFormToForm", () => {
		it("should convert API form to app Form type", () => {
			const apiForm = makeApiForm({ name_es: "Formulario de prueba" });
			const form = apiFormToForm(apiForm);

			expect(form.id).toBe("form-1");
			expect(form.name).toBe("Test Form");
			expect(form.nameEs).toBe("Formulario de prueba");
			expect(form.status).toBe("draft");
			expect(form.currentVersion).toBe(1);
			expect(form.versions).toHaveLength(1);
		});

		it("should handle null optional fields", () => {
			const apiForm = makeApiForm();
			const form = apiFormToForm(apiForm);

			expect(form.nameEs).toBeUndefined();
			expect(form.descriptionEs).toBeUndefined();
		});
	});

	describe("apiFormSummaryToForm", () => {
		it("should convert API summary to app Form type with empty versions", () => {
			const summary = makeApiFormSummary();
			const form = apiFormSummaryToForm(summary);

			expect(form.id).toBe("form-1");
			expect(form.versions).toHaveLength(0);
		});
	});

	describe("listForms", () => {
		it("should call GET /forms and return converted forms", async () => {
			const apiSummary = makeApiFormSummary();
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: [apiSummary] },
			});

			const forms = await listForms();

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms",
				{ jwt: undefined },
			);
			expect(forms).toHaveLength(1);
			expect(forms[0].id).toBe("form-1");
		});

		it("should append status filter to query string", async () => {
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: [] },
			});

			await listForms({ status: "published" });

			const calledUrl = vi.mocked(fetchJson).mock.calls[0][0] as string;
			expect(calledUrl).toContain("status=published");
		});

		it("should append search filter to query string", async () => {
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: [] },
			});

			await listForms({ search: "invoice" });

			const calledUrl = vi.mocked(fetchJson).mock.calls[0][0] as string;
			expect(calledUrl).toContain("search=invoice");
		});
	});

	describe("getForm", () => {
		it("should call GET /forms/:id and return converted form", async () => {
			const apiForm = makeApiForm();
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: apiForm },
			});

			const form = await getForm("form-1");

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms/form-1",
				{ jwt: undefined },
			);
			expect(form.id).toBe("form-1");
		});

		it("should pass jwt option", async () => {
			const apiForm = makeApiForm();
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: apiForm },
			});

			await getForm("form-1", { jwt: "test-jwt" });

			expect(vi.mocked(fetchJson).mock.calls[0][1]).toEqual({
				jwt: "test-jwt",
			});
		});
	});

	describe("createForm", () => {
		it("should call POST /forms with payload", async () => {
			const apiForm = makeApiForm();
			vi.mocked(fetchJson).mockResolvedValue({
				status: 201,
				json: { success: true, result: apiForm },
			});

			const form = await createForm({ name: "New Form", description: "Desc" });

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ name: "New Form", description: "Desc" }),
				}),
			);
			expect(form.name).toBe("Test Form");
		});
	});

	describe("updateForm", () => {
		it("should call PUT /forms/:id with payload", async () => {
			const apiForm = makeApiForm({ name: "Updated Form" });
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: apiForm },
			});

			const form = await updateForm("form-1", { name: "Updated Form" });

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms/form-1",
				expect.objectContaining({
					method: "PUT",
					body: JSON.stringify({ name: "Updated Form" }),
				}),
			);
			expect(form.name).toBe("Updated Form");
		});
	});

	describe("deleteForm", () => {
		it("should call DELETE /forms/:id", async () => {
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: { deleted: true } },
			});

			await deleteForm("form-1");

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms/form-1",
				expect.objectContaining({ method: "DELETE" }),
			);
		});
	});

	describe("publishForm", () => {
		it("should call POST /forms/:id/publish", async () => {
			const apiForm = makeApiForm({ status: "published" });
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: apiForm },
			});

			const form = await publishForm("form-1");

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms/form-1/publish",
				expect.objectContaining({ method: "POST" }),
			);
			expect(form.status).toBe("published");
		});
	});

	describe("archiveForm", () => {
		it("should call POST /forms/:id/archive", async () => {
			const apiForm = makeApiForm({ status: "archived" });
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: apiForm },
			});

			const form = await archiveForm("form-1");

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms/form-1/archive",
				expect.objectContaining({ method: "POST" }),
			);
			expect(form.status).toBe("archived");
		});
	});

	describe("listFormVersions", () => {
		it("should call GET /forms/:id/versions and return versions", async () => {
			const version = makeApiVersion();
			vi.mocked(fetchJson).mockResolvedValue({
				status: 200,
				json: { success: true, result: [version] },
			});

			const versions = await listFormVersions("form-1");

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms/form-1/versions",
				{ jwt: undefined },
			);
			expect(versions).toHaveLength(1);
			expect(versions[0].version).toBe(1);
		});
	});

	describe("createFormVersion", () => {
		it("should call POST /forms/:id/versions with payload", async () => {
			const version = makeApiVersion({ id: "v2", version: 2 });
			vi.mocked(fetchJson).mockResolvedValue({
				status: 201,
				json: { success: true, result: version },
			});

			const payload = {
				fields: [],
				schema: { input: {}, output: {} },
				changelog: "Added new field",
			};
			const newVersion = await createFormVersion("form-1", payload);

			expect(fetchJson).toHaveBeenCalledWith(
				"https://workflow-svc.test/forms/form-1/versions",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify(payload),
				}),
			);
			expect(newVersion.version).toBe(2);
		});
	});
});
