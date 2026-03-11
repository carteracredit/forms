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
	createFormVersion,
} from "./forms";
import type {
	CreateFormPayload,
	UpdateFormPayload,
	CreateFormVersionPayload,
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
 * Server action: update form metadata.
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
 * Server action: publish a form.
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
 * Server action: list all versions of a form.
 */
export async function listFormVersionsAction(
	formId: string,
): Promise<FormVersion[]> {
	return withJwt((jwt) => listFormVersions(formId, { jwt }));
}

/**
 * Server action: create a new form version.
 */
export async function createFormVersionAction(
	formId: string,
	payload: CreateFormVersionPayload,
): Promise<FormVersion> {
	return withJwt((jwt) => createFormVersion(formId, payload, { jwt }));
}
