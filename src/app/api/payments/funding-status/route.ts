import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { getFundingStatusForTrack } from "@/lib/payments/funding-status";
import type { PaymentTrack } from "@/lib/payments/types";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track") as PaymentTrack | null;

    if (track !== "friends_family" && track !== "private") {
      return NextResponse.json({ error: "Invalid track." }, { status: 400 });
    }

    const status = await getFundingStatusForTrack(user.id, track);
    return NextResponse.json(status);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/payments/funding-status", err);
    return NextResponse.json(
      { error: "Failed to load funding status." },
      { status: 500 },
    );
  }
}
