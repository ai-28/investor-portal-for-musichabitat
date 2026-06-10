import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { getOrCreateWireInstructions } from "@/lib/payments/wire";
import type { PaymentTrack } from "@/lib/payments/types";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track") as PaymentTrack | null;

    if (track !== "friends_family" && track !== "private") {
      return NextResponse.json({ error: "Invalid track." }, { status: 400 });
    }

    const instructions = await getOrCreateWireInstructions(user.id, track);
    return NextResponse.json(instructions);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error) {
      const status = err.message.includes("not configured") ? 503 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("GET /api/payments/wire/instructions", err);
    return NextResponse.json(
      { error: "Failed to load wire instructions." },
      { status: 500 },
    );
  }
}
