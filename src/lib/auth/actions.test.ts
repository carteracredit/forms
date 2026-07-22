import { beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "./authClient";
import { clearSession } from "./sessionStore";
import { getAuthAppUrl } from "./config";
import { logout } from "./actions";

vi.mock("./authClient", () => ({
	authClient: {
		signOut: vi.fn(),
	},
}));

vi.mock("./sessionStore", () => ({
	clearSession: vi.fn(),
}));

vi.mock("./config", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./config")>();
	return {
		...actual,
		getAuthAppUrl: vi.fn(() => "https://auth-app.test"),
	};
});

describe("logout", () => {
	const assignHref = vi.fn();

	beforeEach(() => {
		vi.mocked(authClient.signOut).mockReset();
		vi.mocked(clearSession).mockReset();
		assignHref.mockReset();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: { ...window.location, assign: window.location.assign },
		});
		Object.defineProperty(window.location, "href", {
			configurable: true,
			get: () => "",
			set: assignHref,
		});
	});

	it("on successful signOut runs onSuccess: clears session and redirects", async () => {
		vi.mocked(authClient.signOut).mockImplementation(async (opts) => {
			await opts?.fetchOptions?.onSuccess?.({} as never);
		});

		await logout();

		expect(clearSession).toHaveBeenCalledTimes(1);
		expect(assignHref).toHaveBeenCalledWith("https://auth-app.test/login");
	});

	it("on signOut failure still clears session and redirects", async () => {
		vi.mocked(authClient.signOut).mockRejectedValue(
			new Error("signOut failed"),
		);

		await logout();

		expect(clearSession).toHaveBeenCalledTimes(1);
		expect(assignHref).toHaveBeenCalledWith("https://auth-app.test/login");
	});

	it("uses getAuthAppUrl for redirect target", async () => {
		vi.mocked(getAuthAppUrl).mockReturnValueOnce("https://custom-auth.example");
		vi.mocked(authClient.signOut).mockRejectedValue(new Error("fail"));

		await logout();

		expect(assignHref).toHaveBeenCalledWith(
			"https://custom-auth.example/login",
		);
	});
});
