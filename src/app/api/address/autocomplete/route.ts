import { NextResponse } from "next/server";
import { z } from "zod";
import { googlePlacesAutocomplete } from "@/lib/api/google-places";
import { rateLimit, rateLimitKey } from "@/lib/api/rate-limit";

export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
	return (
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		req.headers.get("x-real-ip") ??
		"unknown"
	);
}

const querySchema = z.object({
	q: z.string().min(2).max(200),
	sessionToken: z.string().max(128).optional(),
});

export async function GET(req: Request) {
	const ip = clientIp(req);
	const rl = rateLimit(rateLimitKey("address-autocomplete", ip), 60, 60_000);
	if (!rl.ok) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{
				status: 429,
				headers: { "Retry-After": String(rl.retryAfterSec ?? 60) },
			},
		);
	}

	const url = new URL(req.url);
	const parsed = querySchema.safeParse({
		q: url.searchParams.get("q") ?? "",
		sessionToken: url.searchParams.get("sessionToken") ?? undefined,
	});
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid query" }, { status: 400 });
	}

	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "Autocomplete is temporarily unavailable" },
			{ status: 503 },
		);
	}

	try {
		const suggestions = await googlePlacesAutocomplete(
			apiKey,
			parsed.data.q,
			parsed.data.sessionToken,
			AbortSignal.timeout(5000),
		);
		return NextResponse.json({ suggestions });
	} catch {
		return NextResponse.json({ error: "Autocomplete failed" }, { status: 503 });
	}
}
