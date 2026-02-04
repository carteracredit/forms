import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, render } from "@testing-library/react";
import { useAuthSession, SessionHydrator } from "./useAuthSession";
import { sessionStore } from "./sessionStore";
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

describe("auth/useAuthSession", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		sessionStore.set({
			data: null,
			error: null,
			isPending: true,
			isAdmin: false,
		});
	});

	describe("useAuthSession hook", () => {
		it("returns initial pending state", () => {
			const { result } = renderHook(() => useAuthSession());
			expect(result.current.isPending).toBe(true);
			expect(result.current.data).toBeNull();
			expect(result.current.error).toBeNull();
			expect(result.current.isAdmin).toBe(false);
		});

		it("returns session data when available", () => {
			const mockSession = createMockSession();

			sessionStore.set({
				data: mockSession,
				error: null,
				isPending: false,
				isAdmin: false,
			});

			const { result } = renderHook(() => useAuthSession());
			expect(result.current.data).toEqual(mockSession);
			expect(result.current.isPending).toBe(false);
		});

		it("returns isAdmin true for admin users", () => {
			const mockSession = createMockSession({
				user: { role: "admin" },
			});

			sessionStore.set({
				data: mockSession,
				error: null,
				isPending: false,
				isAdmin: true,
			});

			const { result } = renderHook(() => useAuthSession());
			expect(result.current.isAdmin).toBe(true);
		});
	});

	describe("SessionHydrator component", () => {
		it("renders children", () => {
			const { container } = render(
				<SessionHydrator serverSession={null}>
					<div>Test Content</div>
				</SessionHydrator>,
			);
			expect(container.textContent).toContain("Test Content");
		});

		it("hydrates session store on mount", () => {
			const mockSession = createMockSession();

			render(
				<SessionHydrator serverSession={mockSession}>
					<div>Test</div>
				</SessionHydrator>,
			);

			const state = sessionStore.get();
			expect(state.data).toEqual(mockSession);
			expect(state.isPending).toBe(false);
			expect(state.isAdmin).toBe(false);
		});

		it("sets isAdmin true for admin sessions", () => {
			const mockSession = createMockSession({
				user: { role: "admin" },
			});

			render(
				<SessionHydrator serverSession={mockSession}>
					<div>Test</div>
				</SessionHydrator>,
			);

			const state = sessionStore.get();
			expect(state.isAdmin).toBe(true);
		});
	});
});
