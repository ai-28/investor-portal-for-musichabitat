import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { createAchPaymentIntent } from "@/lib/payments/ach";
import { isStripeConfigured } from "@/lib/payments/config";
import type { PaymentTrack } from "@/lib/payments/types";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "ACH payments are not configured." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { track?: PaymentTrack };
    const track = body.track;
    if (track !== "friends_family" && track !== "private") {
      return NextResponse.json({ error: "Invalid track." }, { status: 400 });
    }

    const result = await createAchPaymentIntent(user.id, track);
    if (result.alreadyCompleted && !result.transactionId) {
      return NextResponse.json(
        { error: "Payment already completed for this investment." },
        { status: 400 },
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/payments/ach/intent", err);
    return NextResponse.json({ error: "Failed to create payment." }, { status: 500 });
  }
}
