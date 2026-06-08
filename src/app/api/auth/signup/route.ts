import { NextResponse } from "next/server";
import { createPortalUser } from "@/lib/auth/users";
import { ensureProfile } from "@/lib/portal/profile";
import type { OfferingType } from "@/lib/portal/db-types";
import { isAuthConfigured } from "@/lib/auth/options";

function parseOfferingType(value: unknown): OfferingType | undefined {
  if (value === "friends_family" || value === "private") return value;
  return undefined;
}

export async function POST(request: Request) {
  try {
    if (!isAuthConfigured()) {
      return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
      offering_type?: unknown;
    };

    const email = body.email?.trim();
    const password = body.password;
    const offeringType = parseOfferingType(body.offering_type);

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await createPortalUser(email, password);
    await ensureProfile(user.id, user.email, offeringType);

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    console.error("POST /api/auth/signup", err);
    const message = err instanceof Error ? err.message : "Sign up failed.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
