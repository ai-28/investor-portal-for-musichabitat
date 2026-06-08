import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { updateAdminProfile } from "@/lib/admin/admins";

export async function GET() {
  try {
    const user = await requireAdmin();
    return NextResponse.json({ email: user.email, id: user.id });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAdmin();
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      currentPassword?: string;
    };

    if (!body.email?.trim() && !body.password) {
      return NextResponse.json(
        { error: "Provide a new email and/or password to update." },
        { status: 400 },
      );
    }

    const updated = await updateAdminProfile(user.id, {
      email: body.email?.trim(),
      password: body.password,
      currentPassword: body.currentPassword,
    });

    return NextResponse.json({ email: updated.email, id: user.id });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Failed to update profile";
    console.error("PATCH /api/admin/me", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
