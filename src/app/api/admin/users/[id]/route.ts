import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { removeAdmin } from "@/lib/admin/admins";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const current = await requireAdmin();
    const { id } = await params;
    await removeAdmin(id, current.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Failed to remove admin";
    console.error("DELETE /api/admin/users/[id]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
