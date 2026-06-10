import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getTransactionById,
  syncProfilePaymentStatus,
  updateTransactionStatus,
} from "@/lib/payments/transactions";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const tx = await getTransactionById(id);
    if (!tx) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    if (tx.method !== "wire" && tx.method !== "check") {
      return NextResponse.json(
        { error: "Only wire and check payments can be manually confirmed." },
        { status: 400 },
      );
    }

    if (tx.status === "succeeded") {
      return NextResponse.json({ transaction: tx, alreadyConfirmed: true });
    }

    const updated = await updateTransactionStatus(tx.id, "succeeded");
    if (!updated) {
      return NextResponse.json({ error: "Failed to update transaction." }, { status: 500 });
    }

    await syncProfilePaymentStatus(tx.investor_id, tx.track, "succeeded");

    return NextResponse.json({ transaction: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("POST /api/admin/payments/[id]/confirm", err);
    return NextResponse.json({ error: "Failed to confirm payment." }, { status: 500 });
  }
}
