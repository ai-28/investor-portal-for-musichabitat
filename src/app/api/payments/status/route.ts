import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { listTransactionsForInvestor } from "@/lib/payments/transactions";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const transactions = await listTransactionsForInvestor(user.id);
    return NextResponse.json({ transactions });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/payments/status", err);
    return NextResponse.json({ error: "Failed to load payment status." }, { status: 500 });
  }
}
