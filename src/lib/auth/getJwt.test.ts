import { describe, expect, it, vi, beforeEach } from "vitest";
import { getJwt } from "./getJwt";
import { cookies } from "next/headers";

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

vi.mock("./config", () => ({
	getAuthServiceUrl: () => "https://auth-svc.test.com",
	getAuthAppUrl: () => "https://auth.test.com",
}));

describe("auth/getJwt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", vi.fn());
		// Suppress console.error for expected error cases
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("returns null when no session cookie exists", async () => {
		const mockCookies = {
			toString: vi.fn(() => "other-cookie=value"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const result = await getJwt();
		expect(result).toBeNull();
	});

	it("returns null when better-auth.session_token cookie exists but fetch fails", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);
		vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

		const result = await getJwt();
		expect(result).toBeNull();
	});

	it("returns null when response is not ok", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);
		vi.mocked(fetch).mockResolvedValue(
			new Response(null, { status: 401 }) as never,
		);

		const result = await getJwt();
		expect(result).toBeNull();
	});

	it("returns JWT token when response is ok", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockToken = { token: "jwt-token-123" };
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockToken), {
				status: 200,
			}) as never,
		);

		const result = await getJwt();
		expect(result).toBe("jwt-token-123");
		expect(fetch).toHaveBeenCalledWith(
			"https://auth-svc.test.com/api/auth/token",
			{
				headers: {
					Cookie: "better-auth.session_token=abc123",
					Origin: "https://auth.test.com",
					Accept: "application/json",
				},
				cache: "no-store",
			},
		);
	});

	it("returns null when response is ok but token is missing", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({}), {
				status: 200,
			}) as never,
		);

		const result = await getJwt();
		expect(result).toBeNull();
	});

	it("checks for __Secure-better-auth.session_token cookie", async () => {
		const mockCookies = {
			toString: vi.fn(() => "__Secure-better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockToken = { token: "jwt-token-123" };
		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockToken), {
				status: 200,
			}) as never,
		);

		const result = await getJwt();
		expect(result).toBe("jwt-token-123");
	});
});
