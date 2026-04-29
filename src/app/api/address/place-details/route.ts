import { NextResponse } from "next/server";
import { z } from "zod";
import { googlePlaceDetailsToAddress } from "@/lib/api/google-places";
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
	placeId: z.string().min(4).max(256),
});

export async function GET(req: Request) {
	const ip = clientIp(req);
	const rl = rateLimit(rateLimitKey("address-place-details", ip), 60, 60_000);
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
		placeId: url.searchParams.get("placeId") ?? "",
	});
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid placeId" }, { status: 400 });
	}

	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
	if (!apiKey) {
		return NextResponse.json(
			{ error: "Place lookup is temporarily unavailable" },
			{ status: 503 },
		);
	}

	try {
		const address = await googlePlaceDetailsToAddress(
			apiKey,
			parsed.data.placeId,
			AbortSignal.timeout(5000),
		);
		return NextResponse.json({ address });
	} catch {
		return NextResponse.json({ error: "Place lookup failed" }, { status: 503 });
	}
}
