import { describe, expect, it, vi } from "vitest";
import { ApiError, fetchJson, extractApiErrorMessage } from "./http";

describe("api/http fetchJson", () => {
	it("returns parsed JSON for ok responses", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ ok: true }), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			}),
		);

		const res = await fetchJson<{ ok: boolean }>("https://example.com");
		expect(res.status).toBe(200);
		expect(res.json).toEqual({ ok: true });
	});

	it("returns null when JSON parsing fails but response is ok", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response("not json", {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			}),
		);

		const res = await fetchJson<unknown>("https://example.com");
		expect(res.json).toBeNull();
	});

	it("returns text when content-type is not JSON", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response("ok", {
					status: 200,
					headers: { "content-type": "text/plain" },
				});
			}),
		);

		const res = await fetchJson<string>("https://example.com");
		expect(res.json).toBe("ok");
	});

	it("throws ApiError and includes parsed body on non-2xx JSON responses", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ message: "bad" }), {
					status: 400,
					statusText: "Bad Request",
					headers: { "content-type": "application/json" },
				});
			}),
		);

		await expect(fetchJson("https://example.com")).rejects.toBeInstanceOf(
			ApiError,
		);

		try {
			await fetchJson("https://example.com");
		} catch (e) {
			const err = e as ApiError;
			expect(err.status).toBe(400);
			expect(err.body).toEqual({ message: "bad" });
		}
	});

	it("throws ApiError and includes text body on non-2xx non-JSON responses", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response("oops", {
					status: 500,
					statusText: "Internal Server Error",
					headers: { "content-type": "text/plain" },
				});
			}),
		);

		try {
			await fetchJson("https://example.com");
			throw new Error("expected to throw");
		} catch (e) {
			const err = e as ApiError;
			expect(err.status).toBe(500);
			expect(err.body).toBe("oops");
		}
	});

	it("includes Authorization header when jwt option is provided", async () => {
		const mockFetch = vi.fn(async (_url: string, _init?: RequestInit) => {
			return new Response(JSON.stringify({}), {
				status: 200,
				headers: { "content-type": "application/json" },
			});
		});
		vi.stubGlobal("fetch", mockFetch);

		await fetchJson("https://example.com", { jwt: "my-token" });

		const calledInit = mockFetch.mock.calls[0][1] as RequestInit;
		const calledHeaders = calledInit?.headers as Record<string, string>;
		expect(calledHeaders.Authorization).toBe("Bearer my-token");
	});

	it("does not include Authorization header when jwt is not provided", async () => {
		const mockFetch = vi.fn(async (_url: string, _init?: RequestInit) => {
			return new Response(JSON.stringify({}), {
				status: 200,
				headers: { "content-type": "application/json" },
			});
		});
		vi.stubGlobal("fetch", mockFetch);

		await fetchJson("https://example.com");

		const calledInit = mockFetch.mock.calls[0][1] as RequestInit;
		const calledHeaders = calledInit?.headers as Record<string, string>;
		expect(calledHeaders.Authorization).toBeUndefined();
	});
});

describe("extractApiErrorMessage", () => {
	it("extracts message from Chanfana errors array format", () => {
		const error = new ApiError("Request failed: 400 Bad Request", {
			status: 400,
			body: { errors: [{ message: "Form not found" }] },
		});
		expect(extractApiErrorMessage(error)).toBe("Form not found");
	});

	it("extracts error from custom endpoint format", () => {
		const error = new ApiError("Request failed: 422 Unprocessable Entity", {
			status: 422,
			body: { error: "Cannot publish form", details: "Form has no fields" },
		});
		expect(extractApiErrorMessage(error)).toBe(
			"Cannot publish form: Form has no fields",
		);
	});

	it("extracts error without details", () => {
		const error = new ApiError("Request failed: 404 Not Found", {
			status: 404,
			body: { error: "Not found" },
		});
		expect(extractApiErrorMessage(error)).toBe("Not found");
	});

	it("falls back to error.message for ApiError with no recognized body format", () => {
		const error = new ApiError("Unexpected error", {
			status: 500,
			body: { unknown: "format" },
		});
		expect(extractApiErrorMessage(error)).toBe("Unexpected error");
	});

	it("extracts message from plain Error", () => {
		const error = new Error("Network timeout");
		expect(extractApiErrorMessage(error)).toBe("Network timeout");
	});

	it("returns fallback for unknown error types", () => {
		expect(extractApiErrorMessage("string error")).toBe("Error desconocido");
		expect(extractApiErrorMessage(null)).toBe("Error desconocido");
		expect(extractApiErrorMessage(42)).toBe("Error desconocido");
	});

	it("handles empty errors array", () => {
		const error = new ApiError("Request failed", {
			status: 400,
			body: { errors: [] },
		});
		expect(extractApiErrorMessage(error)).toBe("Request failed");
	});
});
