import { describe, expect, it } from "vitest";
import type { Session } from "./types";
import { isAdminRole } from "./types";

describe("auth/types", () => {
	describe("isAdminRole", () => {
		it("returns true for 'admin' role", () => {
			expect(isAdminRole("admin")).toBe(true);
		});

		it("returns true for 'Admin' role (case insensitive)", () => {
			expect(isAdminRole("Admin")).toBe(true);
		});

		it("returns true for 'ADMIN' role (case insensitive)", () => {
			expect(isAdminRole("ADMIN")).toBe(true);
		});

		it("returns true when admin is in comma-separated roles", () => {
			expect(isAdminRole("user,admin")).toBe(true);
		});

		it("returns true when admin is in comma-separated roles with spaces", () => {
			expect(isAdminRole("user, admin, moderator")).toBe(true);
		});

		it("returns true when admin is first in list", () => {
			expect(isAdminRole("admin,user")).toBe(true);
		});

		it("returns false for 'user' role", () => {
			expect(isAdminRole("user")).toBe(false);
		});

		it("returns false for null", () => {
			expect(isAdminRole(null)).toBe(false);
		});

		it("returns false for undefined", () => {
			expect(isAdminRole(undefined)).toBe(false);
		});

		it("returns false for empty string", () => {
			expect(isAdminRole("")).toBe(false);
		});

		it("returns false for roles that contain admin as substring", () => {
			// "administrator" should not match as "admin"
			expect(isAdminRole("administrator")).toBe(false);
		});
	});

	describe("Session type", () => {
		it("Session type can be null", () => {
			const session: Session = null;
			expect(session).toBeNull();
		});

		it("Session type has user and session when not null", () => {
			const session: Session = {
				user: {
					id: "user-123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-abc",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};
			expect(session?.user.id).toBe("user-123");
			expect(session?.session.id).toBe("session-123");
		});

		it("Session user can have role", () => {
			const session: Session = {
				user: {
					id: "user-123",
					name: "Admin User",
					email: "admin@example.com",
					image: null,
					emailVerified: true,
					role: "admin",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-abc",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};
			expect(session?.user.role).toBe("admin");
		});

		it("Session user can have banned status", () => {
			const session: Session = {
				user: {
					id: "user-123",
					name: "Banned User",
					email: "banned@example.com",
					image: null,
					emailVerified: true,
					banned: true,
					banReason: "Violation",
					banExpires: new Date("2025-12-31"),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-abc",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};
			expect(session?.user.banned).toBe(true);
			expect(session?.user.banReason).toBe("Violation");
		});

		it("Session can include impersonation info", () => {
			const session: Session = {
				user: {
					id: "user-123",
					name: "User",
					email: "user@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-abc",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
					impersonatedBy: "admin-456",
				},
			};
			expect(session?.session.impersonatedBy).toBe("admin-456");
		});

		it("Session can include IP and user agent", () => {
			const session: Session = {
				user: {
					id: "user-123",
					name: "User",
					email: "user@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-abc",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: "192.168.1.1",
					userAgent: "Mozilla/5.0",
				},
			};
			expect(session?.session.ipAddress).toBe("192.168.1.1");
			expect(session?.session.userAgent).toBe("Mozilla/5.0");
		});
	});
});
