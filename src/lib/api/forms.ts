import { fetchJson } from "./http";
import { getWorkflowServiceUrl } from "./config";
import type { Form, FormField, FormVersion } from "../types/form";

// ---------------------------------------------------------------------------
// Response envelope from workflow-svc
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
	success: boolean;
	result: T;
}

// ---------------------------------------------------------------------------
// API types matching workflow-svc response shapes
// ---------------------------------------------------------------------------

export interface ApiFormVersion {
	id: string;
	form_id: string;
	version: number;
	fields: FormField[];
	schema: { input: Record<string, unknown>; output: Record<string, unknown> };
	changelog: string | null;
	created_by: string | null;
	created_at: string;
}

export interface ApiForm {
	id: string;
	name: string;
	name_es: string | null;
	description: string;
	description_es: string | null;
	status: "draft" | "published" | "archived";
	current_version: number;
	tags: string[];
	/** Current working draft fields (not yet published). */
	draft_fields: FormField[];
	created_at: string;
	updated_at: string;
	versions: ApiFormVersion[];
}

export interface ApiFormSummary {
	id: string;
	name: string;
	name_es: string | null;
	description: string;
	description_es: string | null;
	status: "draft" | "published" | "archived";
	current_version: number;
	tags: string[];
	created_at: string;
	updated_at: string;
}

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

export interface CreateFormPayload {
	name: string;
	name_es?: string;
	description?: string;
	description_es?: string;
	tags?: string[];
}

export interface UpdateFormPayload {
	name?: string;
	name_es?: string;
	description?: string;
	description_es?: string;
	tags?: string[];
}

export interface SaveFieldsDraftPayload {
	fields: FormField[];
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface FormsApiOptions {
	jwt?: string;
}

export interface ListFormsOptions extends FormsApiOptions {
	status?: "draft" | "published" | "archived";
	search?: string;
}

// ---------------------------------------------------------------------------
// Converters: API shape -> app Form type
// ---------------------------------------------------------------------------

function apiVersionToFormVersion(v: ApiFormVersion): FormVersion {
	return {
		id: v.id,
		version: v.version,
		createdAt: v.created_at,
		createdBy: v.created_by ?? "Unknown",
		changelog: v.changelog ?? undefined,
		fields: v.fields,
		schema: v.schema,
	};
}

export function apiFormToForm(apiForm: ApiForm): Form {
	return {
		id: apiForm.id,
		name: apiForm.name,
		nameEs: apiForm.name_es ?? undefined,
		description: apiForm.description,
		descriptionEs: apiForm.description_es ?? undefined,
		status: apiForm.status,
		currentVersion: apiForm.current_version,
		draftFields: apiForm.draft_fields ?? [],
		versions: apiForm.versions.map(apiVersionToFormVersion),
		createdAt: apiForm.created_at,
		updatedAt: apiForm.updated_at,
		tags: apiForm.tags,
	};
}

export function apiFormSummaryToForm(s: ApiFormSummary): Form {
	return {
		id: s.id,
		name: s.name,
		nameEs: s.name_es ?? undefined,
		description: s.description,
		descriptionEs: s.description_es ?? undefined,
		status: s.status,
		currentVersion: s.current_version,
		draftFields: [],
		versions: [],
		createdAt: s.created_at,
		updatedAt: s.updated_at,
		tags: s.tags,
	};
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * GET /forms
 * Returns a list of all forms (summary, no versions).
 */
export async function listForms(options?: ListFormsOptions): Promise<Form[]> {
	const baseUrl = getWorkflowServiceUrl();
	const url = new URL(`${baseUrl}/forms`);

	if (options?.status) {
		url.searchParams.set("status", options.status);
	}
	if (options?.search) {
		url.searchParams.set("search", options.search);
	}

	const { json } = await fetchJson<ApiResponse<ApiFormSummary[]>>(
		url.toString(),
		{ jwt: options?.jwt },
	);

	return json.result.map(apiFormSummaryToForm);
}

/**
 * GET /forms/:id
 * Returns a form with all its versions.
 */
export async function getForm(
	formId: string,
	options?: FormsApiOptions,
): Promise<Form> {
	const baseUrl = getWorkflowServiceUrl();
	const { json } = await fetchJson<ApiResponse<ApiForm>>(
		`${baseUrl}/forms/${formId}`,
		{ jwt: options?.jwt },
	);
	return apiFormToForm(json.result);
}

/**
 * POST /forms
 * Creates a new form with an initial empty version 1.
 */
export async function createForm(
	payload: CreateFormPayload,
	options?: FormsApiOptions,
): Promise<Form> {
	const baseUrl = getWorkflowServiceUrl();
	const { json } = await fetchJson<ApiResponse<ApiForm>>(`${baseUrl}/forms`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload),
		jwt: options?.jwt,
	});
	return apiFormToForm(json.result);
}

/**
 * PUT /forms/:id
 * Updates form metadata (name, description, tags).
 */
export async function updateForm(
	formId: string,
	payload: UpdateFormPayload,
	options?: FormsApiOptions,
): Promise<Form> {
	const baseUrl = getWorkflowServiceUrl();
	const { json } = await fetchJson<ApiResponse<ApiForm>>(
		`${baseUrl}/forms/${formId}`,
		{
			method: "PUT",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(payload),
			jwt: options?.jwt,
		},
	);
	return apiFormToForm(json.result);
}

/**
 * DELETE /forms/:id
 * Deletes a draft form and all its versions.
 */
export async function deleteForm(
	formId: string,
	options?: FormsApiOptions,
): Promise<void> {
	const baseUrl = getWorkflowServiceUrl();
	await fetchJson<ApiResponse<{ deleted: boolean }>>(
		`${baseUrl}/forms/${formId}`,
		{ method: "DELETE", jwt: options?.jwt },
	);
}

/**
 * POST /forms/:id/publish
 * Transitions a form from draft to published.
 */
export async function publishForm(
	formId: string,
	options?: FormsApiOptions,
): Promise<Form> {
	const baseUrl = getWorkflowServiceUrl();
	const { json } = await fetchJson<ApiResponse<ApiForm>>(
		`${baseUrl}/forms/${formId}/publish`,
		{ method: "POST", jwt: options?.jwt },
	);
	return apiFormToForm(json.result);
}

/**
 * POST /forms/:id/archive
 * Transitions a form from published to archived.
 */
export async function archiveForm(
	formId: string,
	options?: FormsApiOptions,
): Promise<Form> {
	const baseUrl = getWorkflowServiceUrl();
	const { json } = await fetchJson<ApiResponse<ApiForm>>(
		`${baseUrl}/forms/${formId}/archive`,
		{ method: "POST", jwt: options?.jwt },
	);
	return apiFormToForm(json.result);
}

/**
 * GET /forms/:id/versions
 * Returns all published versions of a form ordered ascending.
 */
export async function listFormVersions(
	formId: string,
	options?: FormsApiOptions,
): Promise<FormVersion[]> {
	const baseUrl = getWorkflowServiceUrl();
	const { json } = await fetchJson<ApiResponse<ApiFormVersion[]>>(
		`${baseUrl}/forms/${formId}/versions`,
		{ jwt: options?.jwt },
	);
	return json.result.map(apiVersionToFormVersion);
}

/**
 * PUT /forms/:id (with fields)
 * Saves the working draft fields without creating a version.
 * No new form_version row is created — call publishForm() to create one.
 */
export async function saveFieldsDraft(
	formId: string,
	payload: SaveFieldsDraftPayload,
	options?: FormsApiOptions,
): Promise<Form> {
	const baseUrl = getWorkflowServiceUrl();
	const { json } = await fetchJson<ApiResponse<ApiForm>>(
		`${baseUrl}/forms/${formId}`,
		{
			method: "PUT",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(payload),
			jwt: options?.jwt,
		},
	);
	return apiFormToForm(json.result);
}
