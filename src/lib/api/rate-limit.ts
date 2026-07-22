/**
 * In-memory sliding-window rate limiter per logical key (e.g. route + client IP).
 * Suitable for single-isolate dev / moderate traffic; swap for KV if you need
 * durable limits across isolates.
 */

type WindowState = { count: number; windowStart: number };

const windows = new Map<string, WindowState>();

export interface RateLimitResult {
	ok: boolean;
	retryAfterSec?: number;
}

/**
 * Returns whether the request is allowed under `limit` requests per `windowMs`.
 */
export function rateLimit(
	key: string,
	limit: number,
	windowMs: number,
): RateLimitResult {
	const now = Date.now();
	let state = windows.get(key);
	if (!state || now - state.windowStart >= windowMs) {
		state = { count: 0, windowStart: now };
	}

	if (state.count >= limit) {
		const retryAfterMs = state.windowStart + windowMs - now;
		return {
			ok: false,
			retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
		};
	}

	state.count++;
	windows.set(key, state);
	return { ok: true };
}

export function rateLimitKey(routeName: string, clientIp: string): string {
	return `${routeName}:${clientIp}`;
}

/** For tests only */
export function clearRateLimitStore(): void {
	windows.clear();
}
