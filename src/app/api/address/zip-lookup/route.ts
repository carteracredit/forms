import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import { uspsCityStateLookup } from "@/lib/api/usps";

export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
	return (
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		req.headers.get("x-real-ip") ??
		"unknown"
	);
}

const querySchema = z.object({
	zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
});

export async function GET(req: Request) {
	const ip = clientIp(req);
	const rl = rateLimit(rateLimitKey("address-zip", ip), 60, 60_000);
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
		zip: url.searchParams.get("zip") ?? "",
	});
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid ZIP code" }, { status: 400 });
	}

	const clientId = process.env.USPS_CLIENT_ID;
	const clientSecret = process.env.USPS_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		return NextResponse.json(
			{ error: "Address lookup is temporarily unavailable" },
			{ status: 503 },
		);
	}

	try {
		const result = await uspsCityStateLookup(
			{ clientId, clientSecret },
			parsed.data.zip,
			AbortSignal.timeout(5000),
		);
		return NextResponse.json(result);
	} catch {
		return NextResponse.json({ error: "ZIP lookup failed" }, { status: 503 });
	}
}
