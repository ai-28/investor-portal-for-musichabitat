import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { isDocuSignConfigured } from "@/lib/docusign/config";
import { downloadCombinedDocument, syncEnvelopeFromDocuSignSafe } from "@/lib/docusign/envelopes";
import { getEnvelopeRecord } from "@/lib/docusign/store";
import type { OfferingType } from "@/lib/portal/db-types";

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

    let record = await getEnvelopeRecord(user.id, track, docId);
    if (!record) {
      return NextResponse.json(
        { error: "No signing session found for this document." },
        { status: 404 },
      );
    }

    if (record.status === "sent") {
      const synced = await syncEnvelopeFromDocuSignSafe(record.envelope_id, true);
      if (synced) record = synced;
    }

    if (
      record.status !== "investor_signed" &&
      record.status !== "completed"
    ) {
      return NextResponse.json(
        { error: "Document is not available to download yet." },
        { status: 409 },
      );
    }

    const { buffer, filename } = await downloadCombinedDocument(
      record.envelope_id,
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/docusign/document", err);
    return NextResponse.json(
      { error: "Could not download document." },
      { status: 500 },
    );
  }
}
