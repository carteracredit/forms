import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	clearUspsTokenCache,
	getUspsAccessToken,
	uspsCityStateLookup,
	uspsValidateAddress,
} from "./usps";

const creds = { clientId: "cid", clientSecret: "sec" };

describe("usps api helpers", () => {
	beforeEach(() => {
		clearUspsTokenCache();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("getUspsAccessToken caches token until expiry (single OAuth POST)", async () => {
		const fetchSpy = vi.fn(async (url: RequestInfo | URL) => {
			const u = typeof url === "string" ? url : url.toString();
			if (u.includes("/oauth2/v3/token")) {
				return new Response(
					JSON.stringify({
						access_token: "tok-a",
						expires_in: 3600,
					}),
					{ status: 200, headers: { "content-type": "application/json" } },
				);
			}
			return new Response("{}", { status: 404 });
		});
		vi.stubGlobal("fetch", fetchSpy);

		const a = await getUspsAccessToken(creds);
		const b = await getUspsAccessToken(creds);
		expect(a).toBe("tok-a");
		expect(b).toBe("tok-a");
		expect(
			fetchSpy.mock.calls.filter((c) => String(c[0]).includes("oauth2")).length,
		).toBe(1);
	});

	it("uspsCityStateLookup retries once after 401 with fresh token", async () => {
		let oauthCalls = 0;
		let cityStateCalls = 0;

		const fetchSpy = vi.fn(
			async (url: RequestInfo | URL, init?: RequestInit) => {
				const u = typeof url === "string" ? url : url.toString();
				if (u.includes("/oauth2/v3/token")) {
					oauthCalls++;
					return new Response(
						JSON.stringify({
							access_token: `tok-${oauthCalls}`,
							expires_in: 3600,
						}),
						{ status: 200, headers: { "content-type": "application/json" } },
					);
				}
				if (u.includes("/addresses/v3/city-state")) {
					cityStateCalls++;
					if (cityStateCalls === 1) {
						return new Response(JSON.stringify({ error: "expired" }), {
							status: 401,
						});
					}
					return new Response(
						JSON.stringify({
							city: "Springfield",
							state: "IL",
							ZIPCode: "62701",
						}),
						{ status: 200, headers: { "content-type": "application/json" } },
					);
				}
				return new Response("not found", { status: 404 });
			},
		);
		vi.stubGlobal("fetch", fetchSpy);

		const result = await uspsCityStateLookup(
			creds,
			"62701",
			new AbortController().signal,
		);

		expect(result.city).toBe("Springfield");
		expect(result.state).toBe("IL");
		expect(oauthCalls).toBe(2);
		expect(cityStateCalls).toBe(2);
	});

	it("uspsValidateAddress parses standardized address fields", async () => {
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
				if (u.includes("/addresses/v3/address")) {
					return new Response(
						JSON.stringify({
							address: {
								streetAddress: "1 Main St",
								city: "Springfield",
								state: "IL",
								ZIPCode: "62701",
							},
							dpvConfirmation: "Y",
						}),
						{ status: 200, headers: { "content-type": "application/json" } },
					);
				}
				return new Response("{}", { status: 404 });
			}),
		);

		const out = await uspsValidateAddress(
			creds,
			{
				street: "1 Main",
				city: "Springfield",
				state: "IL",
				zip: "62701",
			},
			new AbortController().signal,
		);

		expect(out.standardized.street).toBe("1 Main St");
		expect(out.dpvMatch).toBe("Y");
		expect(out.changed).toBe(true);
	});
});
