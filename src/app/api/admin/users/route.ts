import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { addAdmin, listAdmins } from "@/lib/admin/admins";

export async function GET() {
  try {
    await requireAdmin();
    const admins = await listAdmins();
    return NextResponse.json({ admins });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/admin/users", err);
    return NextResponse.json({ error: "Failed to load admins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const admin = await addAdmin(email, password);
    return NextResponse.json({ admin }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Failed to add admin";
    const status = message.includes("already") ? 409 : 400;
    console.error("POST /api/admin/users", err);
    return NextResponse.json({ error: message }, { status });
  }
}
