import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { isDocuSignConfigured } from "@/lib/docusign/config";
import { refreshTrackSigningState } from "@/lib/docusign/webhook";
import { DOCUSIGN } from "@/portal/data/doc-config";
import { PRIVATE } from "@/portal/data/private-offering";
import type { OfferingType } from "@/lib/portal/db-types";

function docIdsForTrack(track: OfferingType): string[] {
  if (track === "private") {
    return PRIVATE.signDocs.map((d) => d.id);
  }
  return DOCUSIGN.documents.map((d) => d.id);
}

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track") as OfferingType | null;

    if (track !== "friends_family" && track !== "private") {
      return NextResponse.json({ error: "Invalid track." }, { status: 400 });
    }

    if (!isDocuSignConfigured()) {
      return NextResponse.json({
        enabled: false,
        signed: {},
        statuses: {},
      });
    }

    const docIdsParam = searchParams.get("docIds");
    const docIds = docIdsParam
      ? docIdsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : docIdsForTrack(track);
    const sync = searchParams.get("sync") === "1";
    const { signed, statuses } = await refreshTrackSigningState(
      user.id,
      user.email,
      track,
      docIds,
      { sync },
    );

    return NextResponse.json({ enabled: true, signed, statuses });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/docusign/status", err);
    return NextResponse.json({ error: "Failed to load signing status." }, { status: 500 });
  }
}
