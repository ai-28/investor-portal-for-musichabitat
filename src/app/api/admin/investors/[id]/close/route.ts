import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getInvestorForAdmin } from "@/lib/admin/investors";
import {
  closeFriendsFamilyInvestor,
  guardianSerialToRoman,
} from "@/lib/portal/guardian-serial";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await getInvestorForAdmin(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const profile = await closeFriendsFamilyInvestor(id);
    return NextResponse.json({
      profile,
      guardian_serial: profile.guardian_serial,
      guardian_serial_roman:
        profile.guardian_serial != null
          ? guardianSerialToRoman(profile.guardian_serial)
          : null,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/admin/investors/[id]/close", err);
    return NextResponse.json({ error: "Failed to close investor" }, { status: 500 });
  }
}
