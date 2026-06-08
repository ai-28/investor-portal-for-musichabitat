import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";

const SYSTEM_PROMPT =
  "You are the Music Habitat Investor Assistant for the Circle 35 Friends & Family round (Rule 506(b)). Answer concisely, factually, and only about Music Habitat, StageBid, and this offering. Key terms: $10M pre-money cap, 10,000,000 shares at $1.00/share, SAFE converting to Class B Preferred on a Qualified Financing >= $500,000, 5% discount, 3x warrant coverage at 95% of FMV exercisable within 9 months, $500 minimum / $25,000 maximum per investor, Class B is pari passu with Class A on economics with 1:1 voting (Class A 15:1), governing law Montana with AAA arbitration in Montana or Louisiana. Launch market is New Orleans, 2026. Never give legal, tax, or investment advice — direct investors to their own advisors and to the official documents in the Document Center. If unsure, say so and point to brandon@musichabitat.com.";

export async function POST(request: Request) {
  try {
    await requireSessionUser();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Assistant is not configured. Set ANTHROPIC_API_KEY." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      messages?: { role: "user" | "assistant"; content: string }[];
    };

    const messages = body.messages ?? [];
    if (!messages.length || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Anthropic API error", data);
      return NextResponse.json(
        { error: "Assistant request failed" },
        { status: 502 },
      );
    }

    const text =
      (data.content || [])
        .map((b: { type?: string; text?: string }) =>
          b.type === "text" ? b.text : "",
        )
        .filter(Boolean)
        .join("\n") ||
      "I wasn't able to generate a response just now. Please try again, or email brandon@musichabitat.com.";

    return NextResponse.json({ text });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/assistant", err);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
