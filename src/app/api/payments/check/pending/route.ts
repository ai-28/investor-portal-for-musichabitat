import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/portal/profile";
import { amountCentsForTrack } from "@/lib/portal/state";
import {
  createTransaction,
  findPendingCheckTransaction,
  syncProfilePaymentStatus,
} from "@/lib/payments/transactions";
import type { PaymentTrack } from "@/lib/payments/types";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as { track?: PaymentTrack };
    const track = body.track;

    if (track !== "friends_family" && track !== "private") {
      return NextResponse.json({ error: "Invalid track." }, { status: 400 });
    }

    const profile = await getProfile(user.id);
    const amountCents = profile ? amountCentsForTrack(profile, track) : null;
    if (!amountCents) {
      return NextResponse.json({ error: "Investment amount is not set." }, { status: 400 });
    }

    const existing = await findPendingCheckTransaction(user.id, track, amountCents);
    if (existing) {
      return NextResponse.json({
        transactionId: existing.id,
        alreadyRecorded: true,
      });
    }

    const tx = await createTransaction({
      investorId: user.id,
      track,
      method: "check",
      amountCents,
      processor: "manual",
      status: "pending",
    });

    await syncProfilePaymentStatus(user.id, track, "pending");

    return NextResponse.json({ transactionId: tx.id, alreadyRecorded: false });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/payments/check/pending", err);
    return NextResponse.json({ error: "Failed to record check payment." }, { status: 500 });
  }
}
