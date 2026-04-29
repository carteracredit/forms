const PLACES_AUTOCOMPLETE_URL =
	"https://places.googleapis.com/v1/places:autocomplete";

export type AutocompleteSuggestion = {
	placeId: string;
	mainText: string;
	secondaryText: string;
};

/**
 * Google Places API (New) — Autocomplete.
 */
export async function googlePlacesAutocomplete(
	apiKey: string,
	input: string,
	sessionToken: string | undefined,
	signal: AbortSignal,
): Promise<AutocompleteSuggestion[]> {
	const body: Record<string, unknown> = {
		input: input.slice(0, 200),
		includedRegionCodes: ["us"],
	};
	if (sessionToken) body.sessionToken = sessionToken;

	const res = await fetch(PLACES_AUTOCOMPLETE_URL, {
		method: "POST",
		signal,
		headers: {
			"content-type": "application/json",
			"X-Goog-Api-Key": apiKey,
		},
		body: JSON.stringify(body),
	});

	if (res.status === 429) {
		throw new Error("Google Places rate limited");
	}

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Places autocomplete ${res.status}: ${text.slice(0, 200)}`);
	}

	const json = (await res.json()) as {
		suggestions?: Array<{
			placePrediction?: {
				placeId?: string;
				place?: string;
				structuredFormat?: {
					mainText?: { text?: string };
					secondaryText?: { text?: string };
				};
				text?: { text?: string };
			};
		}>;
	};

	const out: AutocompleteSuggestion[] = [];
	for (const s of json.suggestions ?? []) {
		const p = s.placePrediction;
		if (!p) continue;
		const placeId =
			p.placeId ??
			(typeof p.place === "string" ? p.place.replace(/^places\//, "") : "");
		if (!placeId) continue;
		const mainText = p.structuredFormat?.mainText?.text ?? "";
		const secondaryText = p.structuredFormat?.secondaryText?.text ?? "";
		out.push({
			placeId,
			mainText,
			secondaryText,
		});
	}

	return out.slice(0, 10);
}

export type ParsedPlaceAddress = {
	street: string;
	street2?: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	formattedAddress?: string;
};

/**
 * Google Places API (New) — place details + parse US-style components.
 */
export async function googlePlaceDetailsToAddress(
	apiKey: string,
	placeId: string,
	signal: AbortSignal,
): Promise<ParsedPlaceAddress> {
	const name = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
	const url = `https://places.googleapis.com/v1/${name}`;

	const res = await fetch(url, {
		method: "GET",
		signal,
		headers: {
			"X-Goog-Api-Key": apiKey,
			"X-Goog-FieldMask":
				"addressComponents,formattedAddress,shortFormattedAddress",
		},
	});

	if (res.status === 429) {
		throw new Error("Google Places rate limited");
	}

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Places details ${res.status}: ${text.slice(0, 200)}`);
	}

	const json = (await res.json()) as {
		addressComponents?: Array<{
			longText?: string;
			shortText?: string;
			types?: string[];
		}>;
		formattedAddress?: string;
		shortFormattedAddress?: string;
	};

	const formattedAddress =
		json.formattedAddress ?? json.shortFormattedAddress ?? "";

	let streetNumber = "";
	let route = "";
	let subpremise = "";
	let locality = "";
	let admin1 = "";
	let postal = "";
	let country = "United States";

	for (const c of json.addressComponents ?? []) {
		const types = c.types ?? [];
		const long = c.longText ?? "";
		const short = c.shortText ?? "";
		if (types.includes("street_number")) streetNumber = long;
		else if (types.includes("route")) route = long;
		else if (types.includes("subpremise")) subpremise = long;
		else if (types.includes("locality")) locality = long;
		else if (types.includes("administrative_area_level_1"))
			admin1 = short || long;
		else if (types.includes("postal_code")) postal = long;
		else if (types.includes("country")) country = long;
	}

	const street = [streetNumber, route].filter(Boolean).join(" ").trim();

	return {
		street,
		street2: subpremise.trim() || undefined,
		city: locality.trim(),
		state: (admin1 ?? "").trim().slice(0, 2).toUpperCase(),
		zip: postal.replace(/\D/g, "").slice(0, 10),
		country: country.trim() || "United States",
		formattedAddress,
	};
}
