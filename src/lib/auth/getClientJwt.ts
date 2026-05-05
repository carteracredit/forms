"use client";

import { authClient } from "./authClient";

/**
 * JWT for Bearer auth against cases-svc from the browser (JWT plugin).
 */
export async function getClientJwt(): Promise<string | null> {
	try {
		const result = await authClient.token();
		if (result.error || !result.data?.token) {
			return null;
		}
		return result.data.token;
	} catch {
		return null;
	}
}
