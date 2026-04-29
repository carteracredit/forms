import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth/getJwt", () => ({
	getJwt: vi.fn(),
}));

vi.mock("@/lib/api/config", () => ({
	getCasesServiceUrl: vi.fn(() => "https://cases.example"),
}));

import { getJwt } from "@/lib/auth/getJwt";

describe("POST /api/cards/tokenize", () => {
	beforeEach(() => {
		vi.mocked(getJwt).mockResolvedValue("signed-jwt");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("returns 401 when no JWT", async () => {
		vi.mocked(getJwt).mockResolvedValueOnce(null);

		const res = await POST(
			new Request("http://localhost/api/cards/tokenize", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ pan: "4242424242424242" }),
			}),
		);

		expect(res.status).toBe(401);
	});

	it("proxies body and Authorization to cases-svc", async () => {
		const fetchSpy = vi.fn(
			async (_url: RequestInfo | URL, init?: RequestInit) => {
				const h = init?.headers as Headers | Record<string, string> | undefined;
				const auth =
					h instanceof Headers
						? h.get("Authorization")
						: (h?.["Authorization"] ?? h?.["authorization"]);
				expect(auth).toBe("Bearer signed-jwt");
				expect(JSON.parse(String(init?.body))).toEqual({ pan: "x" });
				return new Response(
					JSON.stringify({ success: true, result: { tokenId: "t" } }),
					{
						status: 201,
						headers: { "content-type": "application/json" },
					},
				);
			},
		);
		vi.stubGlobal("fetch", fetchSpy);

		const res = await POST(
			new Request("http://localhost/api/cards/tokenize", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ pan: "x" }),
			}),
		);

		expect(res.status).toBe(201);
		expect(fetchSpy).toHaveBeenCalledWith(
			"https://cases.example/cards/tokenize",
			expect.any(Object),
		);
	});

	it("returns 503 when upstream fetch throws", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new Error("network");
			}),
		);

		const res = await POST(
			new Request("http://localhost/api/cards/tokenize", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ pan: "4242424242424242" }),
			}),
		);

		expect(res.status).toBe(503);
	});
});
