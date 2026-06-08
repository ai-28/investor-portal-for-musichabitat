import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getInvestorForAdmin } from "@/lib/admin/investors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const investor = await getInvestorForAdmin(id);
    if (!investor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ investor });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/investors/[id]", err);
    return NextResponse.json({ error: "Failed to load investor" }, { status: 500 });
  }
}
