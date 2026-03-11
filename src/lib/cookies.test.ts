import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	detectEnvironment,
	getCookieDomain,
	setCookie,
	getCookie,
	deleteCookie,
	COOKIE_NAMES,
} from "./cookies";

describe("cookies", () => {
	describe("detectEnvironment", () => {
		beforeEach(() => {
			// Mock window for tests
			vi.stubGlobal("window", {
				location: {
					hostname: "localhost",
				},
			});
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should return 'local' for localhost", () => {
			vi.stubGlobal("window", {
				location: { hostname: "localhost" },
			});
			expect(detectEnvironment()).toBe("local");
		});

		it("should return 'local' for 127.0.0.1", () => {
			vi.stubGlobal("window", {
				location: { hostname: "127.0.0.1" },
			});
			expect(detectEnvironment()).toBe("local");
		});

		it("should return 'production' for cartera.credit domain", () => {
			vi.stubGlobal("window", {
				location: { hostname: "forms.cartera.credit" },
			});
			expect(detectEnvironment()).toBe("production");
		});

		it("should return 'production' for root cartera.credit", () => {
			vi.stubGlobal("window", {
				location: { hostname: "cartera.credit" },
			});
			expect(detectEnvironment()).toBe("production");
		});

		it("should return 'dev' for workers.dev domain", () => {
			vi.stubGlobal("window", {
				location: { hostname: "forms.carteracredit.workers.dev" },
			});
			expect(detectEnvironment()).toBe("dev");
		});

		it("should return 'preview' for PR preview deployments", () => {
			vi.stubGlobal("window", {
				location: { hostname: "pr-123-forms.carteracredit.workers.dev" },
			});
			expect(detectEnvironment()).toBe("preview");
		});

		it("should return 'local' for undefined window (SSR)", () => {
			vi.stubGlobal("window", undefined);
			expect(detectEnvironment()).toBe("local");
		});
	});

	describe("getCookieDomain", () => {
		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should return undefined for local environment", () => {
			vi.stubGlobal("window", {
				location: { hostname: "localhost" },
			});
			expect(getCookieDomain()).toBeUndefined();
		});

		it("should return .cartera.credit for production", () => {
			vi.stubGlobal("window", {
				location: { hostname: "forms.cartera.credit" },
			});
			expect(getCookieDomain()).toBe(".cartera.credit");
		});

		it("should return .carteracredit.workers.dev for dev", () => {
			vi.stubGlobal("window", {
				location: { hostname: "forms.carteracredit.workers.dev" },
			});
			expect(getCookieDomain()).toBe(".carteracredit.workers.dev");
		});
	});

	describe("setCookie", () => {
		let cookieValue = "";

		beforeEach(() => {
			cookieValue = "";
			vi.stubGlobal("document", {
				get cookie() {
					return cookieValue;
				},
				set cookie(value: string) {
					cookieValue = value;
				},
			});
			vi.stubGlobal("window", {
				location: { hostname: "localhost" },
			});
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should set a cookie with basic options", () => {
			setCookie("test-cookie", "test-value");
			expect(cookieValue).toContain("test-cookie=test-value");
			expect(cookieValue).toContain("path=/");
			expect(cookieValue).toContain("samesite=lax");
		});

		it("should not add secure flag for local environment", () => {
			setCookie("test-cookie", "test-value");
			expect(cookieValue).not.toContain("secure");
		});

		it("should add domain and secure flag for production environment", () => {
			vi.stubGlobal("window", {
				location: { hostname: "forms.cartera.credit" },
			});
			setCookie("test-cookie", "test-value");
			expect(cookieValue).toContain("domain=.cartera.credit");
			expect(cookieValue).toContain("secure");
		});

		it("should return early when document is undefined", () => {
			vi.stubGlobal("document", undefined);
			expect(() => setCookie("test", "value")).not.toThrow();
		});

		it("should use custom options when provided", () => {
			setCookie("test-cookie", "test-value", {
				maxAge: 3600,
				path: "/custom",
				sameSite: "strict",
				secure: true,
			});
			expect(cookieValue).toContain("max-age=3600");
			expect(cookieValue).toContain("path=/custom");
			expect(cookieValue).toContain("samesite=strict");
			expect(cookieValue).toContain("secure");
		});
	});

	describe("getCookie", () => {
		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should return undefined when document is undefined", () => {
			vi.stubGlobal("document", undefined);
			expect(getCookie("test")).toBeUndefined();
		});

		it("should return the cookie value when present", () => {
			vi.stubGlobal("document", {
				cookie: "test-cookie=test-value; other-cookie=other-value",
			});
			expect(getCookie("test-cookie")).toBe("test-value");
		});

		it("should return undefined for non-existent cookie", () => {
			vi.stubGlobal("document", {
				cookie: "test-cookie=test-value",
			});
			expect(getCookie("non-existent")).toBeUndefined();
		});
	});

	describe("deleteCookie", () => {
		let cookieValue = "";

		beforeEach(() => {
			cookieValue = "";
			vi.stubGlobal("document", {
				get cookie() {
					return cookieValue;
				},
				set cookie(value: string) {
					cookieValue = value;
				},
			});
			vi.stubGlobal("window", {
				location: { hostname: "localhost" },
			});
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should delete a cookie by setting max-age to 0", () => {
			deleteCookie("test-cookie");
			expect(cookieValue).toContain("test-cookie=");
			expect(cookieValue).toContain("max-age=0");
		});

		it("should include domain when deleting in production", () => {
			vi.stubGlobal("window", {
				location: { hostname: "forms.cartera.credit" },
			});
			deleteCookie("test-cookie");
			expect(cookieValue).toContain("domain=.cartera.credit");
		});

		it("should return early when document is undefined", () => {
			vi.stubGlobal("document", undefined);
			expect(() => deleteCookie("test")).not.toThrow();
		});
	});

	describe("COOKIE_NAMES", () => {
		it("should have theme cookie name", () => {
			expect(COOKIE_NAMES.THEME).toBe("cartera-theme");
		});

		it("should have language cookie name", () => {
			expect(COOKIE_NAMES.LANGUAGE).toBe("cartera-lang");
		});
	});
});
