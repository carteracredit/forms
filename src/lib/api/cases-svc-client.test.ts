import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClientJwt } from "../auth/getClientJwt";
import {
	autocompleteAddress,
	lookupZip,
	placeDetailsAddress,
	tokenizeCard,
	validateAddressUs,
} from "./cases-svc-client";

vi.mock("../auth/getClientJwt", () => ({
	getClientJwt: vi.fn(),
}));

vi.mock("./config", () => ({
	getCasesServiceUrl: vi.fn(() => "https://cases.test"),
}));

describe("cases-svc-client", () => {
	beforeEach(() => {
		vi.mocked(getClientJwt).mockResolvedValue("test-jwt");
		vi.stubGlobal("fetch", vi.fn());
	});

	it("tokenizeCard posts JSON and returns result", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					result: { token: "tok", last4: "4242" },
				}),
				{ status: 200 },
			),
		);

		const out = await tokenizeCard({
			pan: "4242424242424242",
			expMonth: 12,
			expYear: 2030,
			cvc: "123",
		});

		expect(out).toEqual({ token: "tok", last4: "4242" });
		expect(fetch).toHaveBeenCalledWith(
			"https://cases.test/cards/tokenize",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({
					pan: "4242424242424242",
					expMonth: 12,
					expYear: 2030,
					cvc: "123",
				}),
				headers: expect.objectContaining({
					Authorization: "Bearer test-jwt",
					"Content-Type": "application/json",
				}),
			}),
		);
	});

	it("throws when not authenticated", async () => {
		vi.mocked(getClientJwt).mockResolvedValue(null);

		await expect(
			tokenizeCard({
				pan: "4242424242424242",
				expMonth: 12,
				expYear: 2030,
				cvc: "123",
			}),
		).rejects.toThrow("Unauthorized");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("lookupZip uses GET and returns JSON", async () => {
		const signal = new AbortController().signal;
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ city: "Austin", state: "TX" }), {
				status: 200,
			}),
		);

		await expect(lookupZip("78701", signal)).resolves.toEqual({
			city: "Austin",
			state: "TX",
		});
		expect(fetch).toHaveBeenCalledWith(
			"https://cases.test/address/zip-lookup?zip=78701",
			expect.objectContaining({
				method: "GET",
				signal,
				headers: expect.objectContaining({
					Authorization: "Bearer test-jwt",
				}),
			}),
		);
	});

	it("validateAddressUs posts payload", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(
				JSON.stringify({
					standardized: {
						street: "1 Main",
						city: "Austin",
						state: "TX",
						zip: "78701",
					},
					changed: false,
				}),
				{ status: 200 },
			),
		);

		const res = await validateAddressUs({
			street: "1 Main",
			city: "Austin",
			state: "TX",
			zip: "78701",
		});
		expect(res.changed).toBe(false);
		expect(res.standardized.zip).toBe("78701");
	});

	it("autocompleteAddress omits sessionToken when undefined", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ suggestions: [] }), { status: 200 }),
		);

		await autocompleteAddress("main", undefined);
		expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe(
			"https://cases.test/address/autocomplete?q=main",
		);
	});

	it("autocompleteAddress includes sessionToken when set", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ suggestions: [] }), { status: 200 }),
		);

		await autocompleteAddress("main", "sess-1");
		const url = String(vi.mocked(fetch).mock.calls[0]?.[0]);
		expect(url).toContain("sessionToken=sess-1");
		expect(url).toContain("q=main");
	});

	it("autocompleteAddress defaults suggestions to empty array", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({}), { status: 200 }),
		);

		await expect(autocompleteAddress("x", undefined)).resolves.toEqual([]);
	});

	it("placeDetailsAddress returns address field", async () => {
		const addr = { street: "9", city: "B", state: "TX", zip: "75001" };
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ address: addr }), { status: 200 }),
		);

		await expect(placeDetailsAddress("place-1")).resolves.toEqual(addr);
	});

	it("parseError prefers error, message, errors[0].message, then status", async () => {
		vi.mocked(fetch)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ error: "bad pan" }), {
					status: 400,
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ message: "rate limited" }), {
					status: 429,
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ errors: [{ message: "first err" }] }), {
					status: 422,
				}),
			)
			.mockResolvedValueOnce(
				new Response("not json", { status: 500, statusText: "Server Error" }),
			);

		await expect(
			tokenizeCard({
				pan: "x",
				expMonth: 1,
				expYear: 2030,
				cvc: "1",
			}),
		).rejects.toThrow("bad pan");

		await expect(
			tokenizeCard({
				pan: "x",
				expMonth: 1,
				expYear: 2030,
				cvc: "1",
			}),
		).rejects.toThrow("rate limited");

		await expect(
			tokenizeCard({
				pan: "x",
				expMonth: 1,
				expYear: 2030,
				cvc: "1",
			}),
		).rejects.toThrow("first err");

		await expect(
			tokenizeCard({
				pan: "x",
				expMonth: 1,
				expYear: 2030,
				cvc: "1",
			}),
		).rejects.toThrow("cases-svc error 500");
	});

	it("GET without body does not set Content-Type", async () => {
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ city: "x", state: "y" }), { status: 200 }),
		);

		await lookupZip("12345");
		const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
		expect(init.headers).not.toHaveProperty("Content-Type");
	});
});
