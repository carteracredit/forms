import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRateLimitStore, rateLimit, rateLimitKey } from "./rate-limit";

describe("api/rate-limit", () => {
	beforeEach(() => {
		clearRateLimitStore();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		clearRateLimitStore();
	});

	it("rateLimitKey joins route and IP", () => {
		expect(rateLimitKey("api/foo", "1.2.3.4")).toBe("api/foo:1.2.3.4");
	});

	it("allows requests up to limit within the window", () => {
		expect(rateLimit("k1", 3, 10_000)).toEqual({ ok: true });
		expect(rateLimit("k1", 3, 10_000)).toEqual({ ok: true });
		expect(rateLimit("k1", 3, 10_000)).toEqual({ ok: true });
	});

	it("rejects when limit exceeded and reports retryAfterSec", () => {
		const windowMs = 5000;
		vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
		expect(rateLimit("k-block", 2, windowMs)).toEqual({ ok: true });
		expect(rateLimit("k-block", 2, windowMs)).toEqual({ ok: true });
		vi.setSystemTime(new Date("2026-01-01T00:00:02.500Z"));
		const blocked = rateLimit("k-block", 2, windowMs);
		expect(blocked.ok).toBe(false);
		expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
		expect(blocked.retryAfterSec).toBeLessThanOrEqual(3);
	});

	it("starts a new window after windowMs elapsed", () => {
		const windowMs = 1000;
		vi.setSystemTime(0);
		expect(rateLimit("k2", 1, windowMs)).toEqual({ ok: true });
		expect(rateLimit("k2", 1, windowMs).ok).toBe(false);
		vi.setSystemTime(windowMs);
		expect(rateLimit("k2", 1, windowMs)).toEqual({ ok: true });
	});

	it("isolates keys from each other", () => {
		expect(rateLimit("a", 1, 60_000)).toEqual({ ok: true });
		expect(rateLimit("b", 1, 60_000)).toEqual({ ok: true });
	});

	it("clearRateLimitStore resets counters", () => {
		expect(rateLimit("k3", 1, 60_000)).toEqual({ ok: true });
		expect(rateLimit("k3", 1, 60_000).ok).toBe(false);
		clearRateLimitStore();
		expect(rateLimit("k3", 1, 60_000)).toEqual({ ok: true });
	});
});
