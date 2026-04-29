import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET as getZipLookup } from "./zip-lookup/route";
import { POST as postValidate } from "./validate/route";
import { GET as getAutocomplete } from "./autocomplete/route";
import { GET as getPlaceDetails } from "./place-details/route";
import { clearRateLimitStore } from "@/lib/api/rate-limit";
import { clearUspsTokenCache } from "@/lib/api/usps";

describe("address API routes", () => {
	beforeEach(() => {
		clearRateLimitStore();
		clearUspsTokenCache();
		process.env.USPS_CLIENT_ID = "ci";
		process.env.USPS_CLIENT_SECRET = "cs";
		process.env.GOOGLE_PLACES_API_KEY = "gk";
	});

	afterEach(() => {
		delete process.env.USPS_CLIENT_ID;
		delete process.env.USPS_CLIENT_SECRET;
		delete process.env.GOOGLE_PLACES_API_KEY;
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("zip-lookup returns 400 for invalid ZIP", async () => {
		const res = await getZipLookup(
			new Request("http://localhost/api/address/zip-lookup?zip=12"),
		);
		expect(res.status).toBe(400);
	});

	it("zip-lookup returns 503 when USPS credentials missing", async () => {
		delete process.env.USPS_CLIENT_ID;
		const res = await getZipLookup(
			new Request("http://localhost/api/address/zip-lookup?zip=94102"),
		);
		expect(res.status).toBe(503);
	});

	it("zip-lookup returns city/state on success", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: RequestInfo | URL) => {
				const u = typeof url === "string" ? url : url.toString();
				if (u.includes("/oauth2/v3/token")) {
					return new Response(
						JSON.stringify({ access_token: "t", expires_in: 3600 }),
						{ status: 200, headers: { "content-type": "application/json" } },
					);
				}
				if (u.includes("/city-state")) {
					return new Response(
						JSON.stringify({
							city: "San Francisco",
							state: "CA",
							ZIPCode: "94102",
						}),
						{ status: 200, headers: { "content-type": "application/json" } },
					);
				}
				return new Response("{}", { status: 404 });
			}),
		);

		const res = await getZipLookup(
			new Request("http://localhost/api/address/zip-lookup?zip=94102", {
				headers: { "x-forwarded-for": "10.0.0.1" },
			}),
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as { city: string; state: string };
		expect(body.city).toBe("San Francisco");
		expect(body.state).toBe("CA");
	});

	it("validate returns 400 on bad payload", async () => {
		const res = await postValidate(
			new Request("http://localhost/api/address/validate", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ street: "" }),
			}),
		);
		expect(res.status).toBe(400);
	});

	it("autocomplete returns 400 when query too short", async () => {
		const res = await getAutocomplete(
			new Request("http://localhost/api/address/autocomplete?q=a"),
		);
		expect(res.status).toBe(400);
	});

	it("autocomplete returns suggestions when Google responds", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(
					JSON.stringify({
						suggestions: [
							{
								placePrediction: {
									placeId: "ChIJ123",
									structuredFormat: {
										mainText: { text: "123 Main St" },
										secondaryText: { text: "SF, CA" },
									},
								},
							},
						],
					}),
					{ status: 200, headers: { "content-type": "application/json" } },
				);
			}),
		);

		const res = await getAutocomplete(
			new Request(
				"http://localhost/api/address/autocomplete?q=123%20main&sessionToken=sess",
			),
		);
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			suggestions: Array<{ placeId: string }>;
		};
		expect(body.suggestions?.[0]?.placeId).toBe("ChIJ123");
	});

	it("place-details returns 400 for missing placeId", async () => {
		const res = await getPlaceDetails(
			new Request("http://localhost/api/address/place-details?placeId=a"),
		);
		expect(res.status).toBe(400);
	});

	it("rate limit returns 429 after burst", async () => {
		clearRateLimitStore();
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: RequestInfo | URL) => {
				const u = typeof url === "string" ? url : url.toString();
				if (u.includes("/oauth2/v3/token")) {
					return new Response(
						JSON.stringify({ access_token: "t", expires_in: 3600 }),
						{ status: 200 },
					);
				}
				return new Response(JSON.stringify({ city: "X", state: "CA" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			}),
		);

		let lastStatus = 200;
		for (let i = 0; i < 61; i++) {
			const res = await getZipLookup(
				new Request("http://localhost/api/address/zip-lookup?zip=94102", {
					headers: { "x-forwarded-for": "192.168.1.50" },
				}),
			);
			lastStatus = res.status;
			if (lastStatus === 429) break;
		}
		expect(lastStatus).toBe(429);
	});
});
