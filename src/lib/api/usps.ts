/**
 * USPS APIs v3 — OAuth2 client credentials + address helpers.
 * @see https://developers.usps.com/apis
 */

const USPS_TOKEN_URL = "https://apis.usps.com/oauth2/v3/token";
const USPS_API_BASE = "https://apis.usps.com";

export type UspsCredentials = {
	clientId: string;
	clientSecret: string;
};

type TokenCache = { token: string; expiresAtMs: number };

let tokenCache: TokenCache | null = null;
let inflightToken: Promise<string> | null = null;

/** Test hook */
export function clearUspsTokenCache(): void {
	tokenCache = null;
	inflightToken = null;
}

async function fetchAccessToken(creds: UspsCredentials): Promise<string> {
	const body = new URLSearchParams({
		grant_type: "client_credentials",
		client_id: creds.clientId,
		client_secret: creds.clientSecret,
	});

	const res = await fetch(USPS_TOKEN_URL, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body,
		signal: AbortSignal.timeout(10_000),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`USPS token ${res.status}: ${text.slice(0, 200)}`);
	}

	const json = (await res.json()) as {
		access_token?: string;
		expires_in?: number;
	};
	if (!json.access_token) {
		throw new Error("USPS token response missing access_token");
	}

	const expiresInSec =
		typeof json.expires_in === "number" ? json.expires_in : 3600;
	const expiresAtMs = Date.now() + expiresInSec * 1000 - 60_000; // refresh 60s early

	tokenCache = { token: json.access_token, expiresAtMs };
	return json.access_token;
}

/**
 * Returns a cached USPS bearer token, with single in-flight refresh and 60s skew.
 */
export async function getUspsAccessToken(
	creds: UspsCredentials,
): Promise<string> {
	const now = Date.now();
	if (tokenCache && now < tokenCache.expiresAtMs) {
		return tokenCache.token;
	}
	if (inflightToken) return inflightToken;

	inflightToken = (async () => {
		try {
			return await fetchAccessToken(creds);
		} finally {
			inflightToken = null;
		}
	})();

	return inflightToken;
}

async function uspsAuthorizedFetch(
	creds: UspsCredentials,
	path: string,
	init: RequestInit & { signal?: AbortSignal },
	retryOn401: boolean,
): Promise<Response> {
	let token = await getUspsAccessToken(creds);
	let res = await fetch(`${USPS_API_BASE}${path}`, {
		...init,
		headers: {
			...init.headers,
			Authorization: `Bearer ${token}`,
			accept: "application/json",
		},
	});

	if (res.status === 401 && retryOn401) {
		clearUspsTokenCache();
		token = await getUspsAccessToken(creds);
		res = await fetch(`${USPS_API_BASE}${path}`, {
			...init,
			headers: {
				...init.headers,
				Authorization: `Bearer ${token}`,
				accept: "application/json",
			},
		});
	}

	return res;
}

export type UspsCityStateResult = {
	city: string;
	state: string;
	zip: string;
};

/**
 * ZIP → default city + state (USPS city-state endpoint).
 */
export async function uspsCityStateLookup(
	creds: UspsCredentials,
	zip: string,
	signal: AbortSignal,
): Promise<UspsCityStateResult> {
	const qs = new URLSearchParams({ ZIPCode: zip });
	const res = await uspsAuthorizedFetch(
		creds,
		`/addresses/v3/city-state?${qs.toString()}`,
		{ method: "GET", signal },
		true,
	);

	if (res.status === 429) {
		throw new Error("USPS rate limited");
	}

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`USPS city-state ${res.status}: ${text.slice(0, 200)}`);
	}

	const json = (await res.json()) as Record<string, unknown>;
	// Response shapes vary; normalize common fields
	const city =
		pickString(json, ["city", "City", "defaultCity"]) ??
		pickNested(json, ["address", "city"]) ??
		"";
	const state =
		pickString(json, ["state", "State", "stateCode"]) ??
		pickNested(json, ["address", "state"]) ??
		"";
	const zipOut =
		pickString(json, ["ZIPCode", "zip", "ZIP"]) ??
		pickNested(json, ["address", "ZIPCode"]) ??
		zip;

	return {
		city: city.trim(),
		state: state.trim().slice(0, 2).toUpperCase(),
		zip: zipOut.trim(),
	};
}

export type AddressPayload = {
	street: string;
	street2?: string;
	city: string;
	state: string;
	zip: string;
};

export type UspsValidateResult = {
	standardized: AddressPayload;
	dpvMatch: "Y" | "N" | "S" | "D" | "";
	changed: boolean;
};

function normalizeAddr(a: AddressPayload): string {
	return [
		a.street.trim().toLowerCase(),
		(a.street2 ?? "").trim().toLowerCase(),
		a.city.trim().toLowerCase(),
		a.state.trim().toLowerCase(),
		a.zip.replace(/\D/g, "").slice(0, 5),
	].join("|");
}

/**
 * Standardizes an address via USPS Address API v3.
 */
export async function uspsValidateAddress(
	creds: UspsCredentials,
	input: AddressPayload,
	signal: AbortSignal,
): Promise<UspsValidateResult> {
	const zipDigits = input.zip.replace(/\D/g, "").slice(0, 5);
	const body = {
		address: {
			streetAddress: input.street.trim(),
			secondaryAddress: (input.street2 ?? "").trim(),
			city: input.city.trim(),
			state: input.state.trim(),
			ZIPCode: zipDigits,
		},
	};

	const res = await uspsAuthorizedFetch(
		creds,
		`/addresses/v3/address`,
		{
			method: "POST",
			signal,
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		},
		true,
	);

	if (res.status === 429) {
		throw new Error("USPS rate limited");
	}

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`USPS validate ${res.status}: ${text.slice(0, 200)}`);
	}

	const json = (await res.json()) as Record<string, unknown>;
	const addr =
		(json.address as Record<string, unknown> | undefined) ??
		(json.standardizedAddress as Record<string, unknown> | undefined) ??
		json;

	const street =
		pickString(addr, ["streetAddress", "addressLine1", "street"]) ??
		input.street;
	const street2 =
		pickString(addr, ["secondaryAddress", "addressLine2"]) ??
		input.street2 ??
		"";
	const city = pickString(addr, ["city"]) ?? input.city;
	const state = pickString(addr, ["state"]) ?? input.state;
	const zip = pickString(addr, ["ZIPCode", "zipCode", "ZIP"]) ?? zipDigits;

	const standardized: AddressPayload = {
		street: street.trim(),
		street2: street2.trim() || undefined,
		city: city.trim(),
		state: state.trim().slice(0, 2).toUpperCase(),
		zip: zip.trim(),
	};

	const dpvRaw =
		pickString(json, ["dpvConfirmation", "DPVConfirmation"]) ??
		pickNested(json, ["address", "dpvConfirmation"]) ??
		"";
	const dpvMatch =
		dpvRaw === "Y" || dpvRaw === "N" || dpvRaw === "S" || dpvRaw === "D"
			? dpvRaw
			: "";

	const changed = normalizeAddr(input) !== normalizeAddr(standardized);

	return { standardized, dpvMatch, changed };
}

function pickString(
	obj: Record<string, unknown>,
	keys: string[],
): string | undefined {
	for (const k of keys) {
		const v = obj[k];
		if (typeof v === "string" && v.length > 0) return v;
	}
	return undefined;
}

function pickNested(
	obj: Record<string, unknown>,
	path: [string, string],
): string | undefined {
	const mid = obj[path[0]];
	if (mid && typeof mid === "object") {
		const v = (mid as Record<string, unknown>)[path[1]];
		return typeof v === "string" ? v : undefined;
	}
	return undefined;
}
