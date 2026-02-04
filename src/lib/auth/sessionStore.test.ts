import { describe, expect, it, beforeEach } from "vitest";
import {
	sessionStore,
	setSession,
	clearSession,
	setSessionPending,
	setSessionError,
} from "./sessionStore";
import type { Session } from "./types";

// Helper to create a valid mock session
function createMockSession(
	overrides: Partial<{
		user: Partial<NonNullable<Session>["user"]>;
		session: Partial<NonNullable<Session>["session"]>;
	}> = {},
): NonNullable<Session> {
	const now = new Date();
	return {
		user: {
			id: "1",
			name: "Test User",
			email: "test@example.com",
			image: null,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
			...overrides.user,
		},
		session: {
			id: "session-1",
			userId: "1",
			token: "token-123",
			expiresAt: now,
			createdAt: now,
			updatedAt: now,
			...overrides.session,
		},
	};
}

describe("auth/sessionStore", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		sessionStore.set({
			data: null,
			error: null,
			isPending: true,
			isAdmin: false,
		});
	});

	it("initializes with null session and pending state", () => {
		const state = sessionStore.get();
		expect(state.data).toBeNull();
		expect(state.error).toBeNull();
		expect(state.isPending).toBe(true);
		expect(state.isAdmin).toBe(false);
	});

	it("setSession updates store with session data", () => {
		const mockSession = createMockSession();

		setSession(mockSession);

		const state = sessionStore.get();
		expect(state.data).toEqual(mockSession);
		expect(state.error).toBeNull();
		expect(state.isPending).toBe(false);
		expect(state.isAdmin).toBe(false);
	});

	it("setSession sets isAdmin to true for admin users", () => {
		const mockSession = createMockSession({
			user: { role: "admin" },
		});

		setSession(mockSession);

		const state = sessionStore.get();
		expect(state.isAdmin).toBe(true);
	});

	it("clearSession resets store to null session", () => {
		const mockSession = createMockSession({
			user: { role: "admin" },
		});

		setSession(mockSession);
		clearSession();

		const state = sessionStore.get();
		expect(state.data).toBeNull();
		expect(state.error).toBeNull();
		expect(state.isPending).toBe(false);
		expect(state.isAdmin).toBe(false);
	});

	it("setSessionPending updates pending state", () => {
		setSessionPending(false);
		expect(sessionStore.get().isPending).toBe(false);

		setSessionPending(true);
		expect(sessionStore.get().isPending).toBe(true);
	});

	it("setSessionError sets error and clears pending", () => {
		const error = new Error("Test error");
		setSessionError(error);

		const state = sessionStore.get();
		expect(state.error).toBe(error);
		expect(state.isPending).toBe(false);
	});
});
