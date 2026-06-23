import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { DOCUSIGN_CEO_EMAIL, isDocuSignConfigured } from "@/lib/docusign/config";
import {
  forceNotifySigningParties,
  fetchEnvelopeRecipientSummary,
  syncEnvelopeFromDocuSign,
} from "@/lib/docusign/envelopes";
import { buildCeoSignPortalUrl } from "@/lib/docusign/ceo-sign-link";
import { getEnvelopeRecord } from "@/lib/docusign/store";
import type { OfferingType } from "@/lib/portal/db-types";

/** Sync envelope status and re-send DocuSign notification emails to parties. */
export async function POST(request: Request) {
  if (!isDocuSignConfigured()) {
    return NextResponse.json(
      { error: "DocuSign is not configured." },
      { status: 503 },
    );
  }

  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as {
      docId?: string;
      track?: OfferingType;
    };

    const docId = body.docId?.trim();
    const track = body.track;
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

    const synced = await syncEnvelopeFromDocuSign(record.envelope_id);
    const status = synced?.status ?? record.status;

    const summary = await fetchEnvelopeRecipientSummary(record.envelope_id);
    console.info(
      "DocuSign notify check:",
      record.envelope_id,
      summary.envelopeStatus,
      summary.recipients,
    );

    let notified = false;
    let message: string | undefined;
    let ceoSignUrl: string | undefined;

    if (status === "investor_signed" || status === "completed") {
      // Sync notifies on first transition to investor_signed; this is a fallback
      // if the investor returned before DocuSign reflected completion.
      if (status === "investor_signed") {
        await forceNotifySigningParties(record.envelope_id);
        notified = true;
        try {
          ceoSignUrl = buildCeoSignPortalUrl(record.envelope_id, track);
        } catch {
          /* URL optional */
        }
        message = `Countersign link ready for ${DOCUSIGN_CEO_EMAIL}. If Gmail is empty, use the link below or set RESEND_API_KEY.`;
      } else {
        message = "Completion notifications sent.";
      }
    } else {
      message =
        "Investor has not finished signing yet. In DocuSign, go to the Signature Page, add your fields, then click Finish — do not close the window early.";
    }

    return NextResponse.json({
      status,
      envelopeId: record.envelope_id,
      envelopeStatus: summary.envelopeStatus,
      recipients: summary.recipients,
      ceoEmail: DOCUSIGN_CEO_EMAIL,
      ceoSignUrl,
      notified,
      message,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/docusign/notify", err);
    return NextResponse.json(
      { error: "Could not send DocuSign notifications." },
      { status: 500 },
    );
  }
}
