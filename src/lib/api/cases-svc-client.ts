/**
 * Browser → cases-svc helpers for forms app (cards + US address).
 */

import { getCasesServiceUrl } from "./config";
import { getClientJwt } from "../auth/getClientJwt";

async function authorizedFetch(
	path: string,
	init: RequestInit,
): Promise<Response> {
	const jwt = await getClientJwt();
	if (!jwt) {
		throw new Error("Unauthorized");
	}
	const base = getCasesServiceUrl();
	return fetch(`${base}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${jwt}`,
			...(init.body != null ? { "Content-Type": "application/json" } : {}),
			...init.headers,
		},
	});
}

async function parseError(res: Response): Promise<string> {
	let message = `cases-svc error ${res.status}`;
	try {
		const body = (await res.json()) as {
			error?: string;
			message?: string;
			errors?: Array<{ message?: string }>;
		};
		message =
			body.error ?? body.message ?? body.errors?.[0]?.message ?? message;
	} catch {
		// ignore
	}
	return message;
}

export async function tokenizeCard(body: {
	pan: string;
	expMonth: number;
	expYear: number;
	cvc: string;
	holderName?: string;
}): Promise<import("@algenium/blocks").CardTokenResult> {
	const res = await authorizedFetch("/cards/tokenize", {
		method: "POST",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	const json = (await res.json()) as {
		success: boolean;
		result: import("@algenium/blocks").CardTokenResult;
	};
	return json.result;
}

export async function lookupZip(
	zip: string,
	signal?: AbortSignal,
): Promise<{ city: string; state: string }> {
	const res = await authorizedFetch(
		`/address/zip-lookup?zip=${encodeURIComponent(zip)}`,
		{ method: "GET", signal },
	);
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	return res.json() as Promise<{ city: string; state: string }>;
}

export async function validateAddressUs(
	payload: {
		street: string;
		street2?: string;
		city: string;
		state: string;
		zip: string;
	},
	signal?: AbortSignal,
): Promise<{
	standardized: import("@algenium/blocks").USAddressValue;
	dpvMatch?: "Y" | "N" | "S" | "D" | "";
	changed: boolean;
}> {
	const res = await authorizedFetch("/address/validate", {
		method: "POST",
		body: JSON.stringify(payload),
		signal,
	});
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	return res.json() as Promise<{
		standardized: import("@algenium/blocks").USAddressValue;
		dpvMatch?: "Y" | "N" | "S" | "D" | "";
		changed: boolean;
	}>;
}

export async function autocompleteAddress(
	q: string,
	sessionToken: string | undefined,
	signal?: AbortSignal,
): Promise<
	Array<{ placeId: string; mainText: string; secondaryText: string }>
> {
	const qs = new URLSearchParams({ q });
	if (sessionToken) qs.set("sessionToken", sessionToken);
	const res = await authorizedFetch(`/address/autocomplete?${qs.toString()}`, {
		method: "GET",
		signal,
	});
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	const data = (await res.json()) as {
		suggestions?: Array<{
			placeId: string;
			mainText: string;
			secondaryText: string;
		}>;
	};
	return data.suggestions ?? [];
}

export async function placeDetailsAddress(
	placeId: string,
	signal?: AbortSignal,
): Promise<import("@algenium/blocks").USAddressValue> {
	const res = await authorizedFetch(
		`/address/place-details?placeId=${encodeURIComponent(placeId)}`,
		{ method: "GET", signal },
	);
	if (!res.ok) {
		throw new Error(await parseError(res));
	}
	const data = (await res.json()) as {
		address: import("@algenium/blocks").USAddressValue;
	};
	return data.address;
}
