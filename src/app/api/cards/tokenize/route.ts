import { NextResponse } from "next/server";
import { getJwt } from "@/lib/auth/getJwt";
import { getCasesServiceUrl } from "@/lib/api/config";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	const jwt = await getJwt();
	if (!jwt) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const upstream = `${getCasesServiceUrl().replace(/\/$/, "")}/cards/tokenize`;

	try {
		const res = await fetch(upstream, {
			method: "POST",
			cache: "no-store",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(15_000),
		});

		const text = await res.text();
		return new NextResponse(text, {
			status: res.status,
			headers: {
				"content-type": res.headers.get("content-type") ?? "application/json",
				...(res.status === 429 && res.headers.get("retry-after")
					? { "Retry-After": res.headers.get("retry-after")! }
					: {}),
			},
		});
	} catch {
		return NextResponse.json(
			{ error: "Tokenization service unavailable" },
			{ status: 503 },
		);
	}
}
