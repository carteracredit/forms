import { describe, expect, it, vi, beforeEach } from "vitest";
import {
	getServerSession,
	getAdminSession,
	requireAdminSession,
} from "./getServerSession";
import { cookies } from "next/headers";

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

vi.mock("./config", () => ({
	getAuthServiceUrl: () => "https://auth-svc.test.com",
	getAuthAppUrl: () => "https://auth.test.com",
}));

describe("auth/getServerSession", () => {
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

		const result = await getServerSession();
		expect(result).toBeNull();
	});

	it("returns null when fetch fails", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);
		vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

		const result = await getServerSession();
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

		const result = await getServerSession();
		expect(result).toBeNull();
	});

	it("returns session when response is ok and contains user and session", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockSession = {
			user: {
				id: "1",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			session: {
				id: "session-1",
				userId: "1",
				token: "token-123",
				expiresAt: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockSession), {
				status: 200,
			}) as never,
		);

		const result = await getServerSession();
		expect(result).not.toBeNull();
		expect(result?.user).toEqual(mockSession.user);
		expect(result?.session).toEqual(mockSession.session);
		expect(fetch).toHaveBeenCalledWith(
			"https://auth-svc.test.com/api/auth/get-session",
			{
				headers: {
					Cookie: "better-auth.session_token=abc123",
					Origin: "https://auth.test.com",
				},
				cache: "no-store",
			},
		);
	});

	it("returns null when response is ok but missing user or session", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify({ user: {} }), {
				status: 200,
			}) as never,
		);

		const result = await getServerSession();
		expect(result).toBeNull();
	});
});

describe("getAdminSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", vi.fn());
	});

	it("returns not authenticated when no session", async () => {
		const mockCookies = {
			toString: vi.fn(() => "other-cookie=value"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const result = await getAdminSession();
		expect(result.isAuthenticated).toBe(false);
		expect(result.isAdmin).toBe(false);
		expect(result.session).toBeNull();
		expect(result.error).toBe("Not authenticated");
	});

	it("returns not admin when user has no admin role", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockSession = {
			user: {
				id: "1",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				role: "user",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			session: {
				id: "session-1",
				userId: "1",
				token: "token-123",
				expiresAt: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockSession), { status: 200 }) as never,
		);

		const result = await getAdminSession();
		expect(result.isAuthenticated).toBe(true);
		expect(result.isAdmin).toBe(false);
		expect(result.error).toBe("User does not have admin role");
	});

	it("returns admin session for admin users", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockSession = {
			user: {
				id: "1",
				name: "Admin User",
				email: "admin@example.com",
				image: null,
				emailVerified: true,
				role: "admin",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			session: {
				id: "session-1",
				userId: "1",
				token: "token-123",
				expiresAt: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockSession), { status: 200 }) as never,
		);

		const result = await getAdminSession();
		expect(result.isAuthenticated).toBe(true);
		expect(result.isAdmin).toBe(true);
		expect(result.session).not.toBeNull();
		expect(result.error).toBeUndefined();
	});

	it("returns not admin when user is banned", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockSession = {
			user: {
				id: "1",
				name: "Banned Admin",
				email: "banned@example.com",
				image: null,
				emailVerified: true,
				role: "admin",
				banned: true,
				banReason: "Policy violation",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			session: {
				id: "session-1",
				userId: "1",
				token: "token-123",
				expiresAt: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockSession), { status: 200 }) as never,
		);

		const result = await getAdminSession();
		expect(result.isAuthenticated).toBe(true);
		expect(result.isAdmin).toBe(false);
		expect(result.error).toBe("Policy violation");
	});
});

describe("requireAdminSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", vi.fn());
	});

	it("throws when not authenticated", async () => {
		const mockCookies = {
			toString: vi.fn(() => "other-cookie=value"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		await expect(requireAdminSession()).rejects.toThrow(
			"Authentication required",
		);
	});

	it("throws when not admin", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockSession = {
			user: {
				id: "1",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				role: "user",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			session: {
				id: "session-1",
				userId: "1",
				token: "token-123",
				expiresAt: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockSession), { status: 200 }) as never,
		);

		await expect(requireAdminSession()).rejects.toThrow(
			"User does not have admin role",
		);
	});

	it("returns session for admin users", async () => {
		const mockCookies = {
			toString: vi.fn(() => "better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as never);

		const mockSession = {
			user: {
				id: "1",
				name: "Admin User",
				email: "admin@example.com",
				image: null,
				emailVerified: true,
				role: "admin",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			session: {
				id: "session-1",
				userId: "1",
				token: "token-123",
				expiresAt: new Date().toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};

		vi.mocked(fetch).mockResolvedValue(
			new Response(JSON.stringify(mockSession), { status: 200 }) as never,
		);

		const result = await requireAdminSession();
		expect(result.user.email).toBe("admin@example.com");
	});
});
