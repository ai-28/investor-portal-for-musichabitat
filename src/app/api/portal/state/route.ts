import { NextResponse } from "next/server";
import { getProfile, updateProfile, SessionUserNotFoundError } from "@/lib/portal/profile";
import { profileToPortalState } from "@/lib/portal/state";
import type { PortalStatePatch } from "@/lib/portal/db-types";
import { requireSessionUser } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";

function sessionInvalidResponse() {
  return NextResponse.json({ error: "SESSION_USER_NOT_FOUND" }, { status: 401 });
}

export async function GET() {
  try {
    const user = await requireSessionUser();
    if (!(await getUserById(user.id))) {
      return sessionInvalidResponse();
    }
    const profile = await getProfile(user.id);
    const state = profileToPortalState(profile, user.email);

    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/portal/state", err);
    return NextResponse.json({ error: "Failed to load portal state" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    if (!(await getUserById(user.id))) {
      return sessionInvalidResponse();
    }
    const patch = (await request.json()) as PortalStatePatch;
    const profile = await updateProfile(user.id, user.email, patch);
    const state = profileToPortalState(profile, user.email);

    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof SessionUserNotFoundError) {
      return sessionInvalidResponse();
    }
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/portal/state", err);
    return NextResponse.json({ error: "Failed to save portal state" }, { status: 500 });
  }
}
