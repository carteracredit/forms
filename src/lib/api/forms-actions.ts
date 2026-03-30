"use server";

import { getJwt } from "@/lib/auth/getJwt";
import {
	listForms,
	getForm,
	createForm,
	updateForm,
	deleteForm,
	publishForm,
	archiveForm,
	listFormVersions,
	saveFieldsDraft,
	cloneForm,
} from "./forms";
import type {
	CreateFormPayload,
	UpdateFormPayload,
	SaveFieldsDraftPayload,
	ListFormsOptions,
} from "./forms";
import type { Form, FormVersion } from "@/lib/types/form";

async function withJwt<T>(fn: (jwt: string) => Promise<T>): Promise<T> {
	const jwt = await getJwt();
	if (!jwt) {
		throw new Error("Unauthorized: no JWT available");
	}
	return fn(jwt);
}

/**
 * Server action: list all forms.
 */
export async function listFormsAction(
	options?: Omit<ListFormsOptions, "jwt">,
): Promise<Form[]> {
	return withJwt((jwt) => listForms({ ...options, jwt }));
}

/**
 * Server action: get a single form by ID.
 */
export async function getFormAction(formId: string): Promise<Form> {
	return withJwt((jwt) => getForm(formId, { jwt }));
}

/**
 * Server action: create a new form.
 */
export async function createFormAction(
	payload: CreateFormPayload,
): Promise<Form> {
	return withJwt((jwt) => createForm(payload, { jwt }));
}

/**
 * Server action: update form metadata (name, description, tags).
 */
export async function updateFormAction(
	formId: string,
	payload: UpdateFormPayload,
): Promise<Form> {
	return withJwt((jwt) => updateForm(formId, payload, { jwt }));
}

/**
 * Server action: delete a draft form.
 */
export async function deleteFormAction(formId: string): Promise<void> {
	return withJwt((jwt) => deleteForm(formId, { jwt }));
}

/**
 * Server action: save draft fields without creating a published version.
 */
export async function saveFieldsDraftAction(
	formId: string,
	payload: SaveFieldsDraftPayload,
): Promise<Form> {
	return withJwt((jwt) => saveFieldsDraft(formId, payload, { jwt }));
}

/**
 * Server action: publish a form — creates an immutable version snapshot.
 */
export async function publishFormAction(formId: string): Promise<Form> {
	return withJwt((jwt) => publishForm(formId, { jwt }));
}

/**
 * Server action: archive a form.
 */
export async function archiveFormAction(formId: string): Promise<Form> {
	return withJwt((jwt) => archiveForm(formId, { jwt }));
}

/**
 * Server action: list all published versions of a form.
 */
export async function listFormVersionsAction(
	formId: string,
): Promise<FormVersion[]> {
	return withJwt((jwt) => listFormVersions(formId, { jwt }));
}

/**
 * Server action: clone a form — creates a draft copy with all draft fields.
 */
export async function cloneFormAction(formId: string): Promise<Form> {
	return withJwt((jwt) => cloneForm(formId, { jwt }));
}
