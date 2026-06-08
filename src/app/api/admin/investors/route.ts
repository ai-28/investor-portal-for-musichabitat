import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { listInvestorsForAdmin } from "@/lib/admin/investors";

export async function GET() {
  try {
    await requireAdmin();
    const investors = await listInvestorsForAdmin();
    return NextResponse.json({ investors });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/investors", err);
    return NextResponse.json({ error: "Failed to load investors" }, { status: 500 });
  }
}
