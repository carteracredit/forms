import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import { uspsValidateAddress } from "@/lib/api/usps";

export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
	return (
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		req.headers.get("x-real-ip") ??
		"unknown"
	);
}

const bodySchema = z.object({
	street: z.string().min(1).max(200),
	street2: z.string().max(200).optional(),
	city: z.string().min(1).max(100),
	state: z.string().min(2).max(2),
	zip: z.string().min(5).max(10),
});

export async function POST(req: Request) {
	const ip = clientIp(req);
	const rl = rateLimit(rateLimitKey("address-validate", ip), 30, 60_000);
	if (!rl.ok) {
		return NextResponse.json(
			{ error: "Too many requests" },
			{
				status: 429,
				headers: { "Retry-After": String(rl.retryAfterSec ?? 60) },
			},
		);
	}

	let json: unknown;
	try {
		json = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = bodySchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid address payload" },
			{ status: 400 },
		);
	}

	const clientId = process.env.USPS_CLIENT_ID;
	const clientSecret = process.env.USPS_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		return NextResponse.json(
			{ error: "Address validation is temporarily unavailable" },
			{ status: 503 },
		);
	}

	try {
		const result = await uspsValidateAddress(
			{ clientId, clientSecret },
			parsed.data,
			AbortSignal.timeout(5000),
		);
		return NextResponse.json(result);
	} catch {
		return NextResponse.json({ error: "Validation failed" }, { status: 503 });
	}
}
