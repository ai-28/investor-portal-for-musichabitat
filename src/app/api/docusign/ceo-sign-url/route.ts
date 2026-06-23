import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { isDocuSignConfigured } from "@/lib/docusign/config";
import { buildCeoSignPortalUrl } from "@/lib/docusign/ceo-sign-link";
import { getEnvelopeRecord } from "@/lib/docusign/store";
import type { OfferingType } from "@/lib/portal/db-types";

/** CEO countersign URL when investor has signed (fallback if DocuSign email is suppressed). */
export async function GET(request: Request) {
  if (!isDocuSignConfigured()) {
    return NextResponse.json(
      { error: "DocuSign is not configured." },
      { status: 503 },
    );
  }

  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track") as OfferingType | null;
    const docId = searchParams.get("docId")?.trim();

    if (!docId || (track !== "friends_family" && track !== "private")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const record = await getEnvelopeRecord(user.id, track, docId);
    if (!record) {
      return NextResponse.json(
        { error: "No signing session found." },
        { status: 404 },
      );
    }

    if (
      record.status !== "investor_signed" &&
      record.status !== "completed"
    ) {
      return NextResponse.json(
        { error: "Investor has not finished signing yet." },
        { status: 409 },
      );
    }

    if (record.status === "completed") {
      return NextResponse.json({ url: "", status: record.status });
    }

    const url = buildCeoSignPortalUrl(record.envelope_id, track);
    return NextResponse.json({ url, status: record.status });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/docusign/ceo-sign-url", err);
    return NextResponse.json(
      { error: "Could not create CEO signing URL." },
      { status: 500 },
    );
  }
}
