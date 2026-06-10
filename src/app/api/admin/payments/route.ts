import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { listAllTransactions } from "@/lib/payments/transactions";

export async function GET() {
  try {
    await requireAdmin();
    const transactions = await listAllTransactions();
    return NextResponse.json({ transactions });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/payments", err);
    return NextResponse.json({ error: "Failed to load payments." }, { status: 500 });
  }
}
