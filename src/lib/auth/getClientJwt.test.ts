import { beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "./authClient";
import { getClientJwt } from "./getClientJwt";

vi.mock("./authClient", () => ({
	authClient: {
		token: vi.fn(),
	},
}));

describe("getClientJwt", () => {
	beforeEach(() => {
		vi.mocked(authClient.token).mockReset();
	});

	it("returns token when token() succeeds with data", async () => {
		vi.mocked(authClient.token).mockResolvedValue({
			data: { token: "jwt-abc" },
			error: null,
		} as Awaited<ReturnType<typeof authClient.token>>);

		await expect(getClientJwt()).resolves.toBe("jwt-abc");
	});

	it("returns null when token() reports error", async () => {
		vi.mocked(authClient.token).mockResolvedValue({
			data: null,
			error: { message: "nope" },
		} as Awaited<ReturnType<typeof authClient.token>>);

		await expect(getClientJwt()).resolves.toBeNull();
	});

	it("returns null when token is missing", async () => {
		vi.mocked(authClient.token).mockResolvedValue({
			data: {},
			error: null,
		} as Awaited<ReturnType<typeof authClient.token>>);

		await expect(getClientJwt()).resolves.toBeNull();
	});

	it("returns null when token() throws", async () => {
		vi.mocked(authClient.token).mockRejectedValue(new Error("network"));

		await expect(getClientJwt()).resolves.toBeNull();
	});
});
