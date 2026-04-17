import { describe, expect, it } from "vitest";
import { getAuthServiceUrl, getAuthAppUrl, getEnvironment } from "./config";

describe("auth/config", () => {
	describe("getAuthServiceUrl", () => {
		it("uses NEXT_PUBLIC_AUTH_SERVICE_URL when set", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

			try {
				process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = "https://auth-svc.test.com";
				expect(getAuthServiceUrl()).toBe("https://auth-svc.test.com");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				else process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = prev;
			}
		});

		it("falls back to default when NEXT_PUBLIC_AUTH_SERVICE_URL is unset", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

			try {
				delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				expect(getAuthServiceUrl()).toBe(
					"https://auth-svc.carteracredit.workers.dev",
				);
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				else process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = prev;
			}
		});
	});

	describe("getAuthAppUrl", () => {
		it("uses NEXT_PUBLIC_AUTH_APP_URL when set", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_APP_URL;

			try {
				process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.test.com";
				expect(getAuthAppUrl()).toBe("https://auth.test.com");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
				else process.env.NEXT_PUBLIC_AUTH_APP_URL = prev;
			}
		});

		it("falls back to default when NEXT_PUBLIC_AUTH_APP_URL is unset", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_APP_URL;

			try {
				delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
				expect(getAuthAppUrl()).toBe("https://auth.carteracredit.workers.dev");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
				else process.env.NEXT_PUBLIC_AUTH_APP_URL = prev;
			}
		});
	});

	describe("getEnvironment", () => {
		it("returns prod for production URLs", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

			try {
				process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
					"https://auth-svc.carteracredit.com";
				expect(getEnvironment()).toBe("prod");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				else process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = prev;
			}
		});

		it("returns dev for development URLs", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

			try {
				process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
					"https://auth-svc.carteracredit.workers.dev";
				expect(getEnvironment()).toBe("dev");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				else process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = prev;
			}
		});

		it("returns dev for default URL", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

			try {
				delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				expect(getEnvironment()).toBe("dev");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				else process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = prev;
			}
		});
	});
});
