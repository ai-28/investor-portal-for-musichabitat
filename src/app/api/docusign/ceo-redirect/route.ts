import { NextResponse } from "next/server";
import { isDocuSignConfigured } from "@/lib/docusign/config";
import { createCeoSigningViewUrl, syncEnvelopeFromDocuSignSafe } from "@/lib/docusign/envelopes";
import { verifyCeoSignToken } from "@/lib/docusign/ceo-sign-link";
import { getEnvelopeByDocuSignId } from "@/lib/docusign/store";
import type { OfferingType } from "@/lib/portal/db-types";

/**
 * Stable CEO countersign entry point — creates a new DocuSign session on every visit
 * so email links do not hit ttl_expired from stale recipient-view URLs.
 */
export async function GET(request: Request) {
  if (!isDocuSignConfigured()) {
    return NextResponse.json(
      { error: "DocuSign is not configured." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const envelopeId = searchParams.get("envelope")?.trim();
  const token = searchParams.get("token")?.trim();
  const track = searchParams.get("track") as OfferingType | null;

  if (
    !envelopeId ||
    !token ||
    (track !== "friends_family" && track !== "private")
  ) {
    return NextResponse.json({ error: "Invalid countersign link." }, { status: 400 });
  }

  if (!verifyCeoSignToken(envelopeId, token)) {
    return NextResponse.json({ error: "Invalid countersign link." }, { status: 403 });
  }

  let record = await getEnvelopeByDocuSignId(envelopeId);
  if (!record || record.track !== track) {
    return NextResponse.json(
      { error: "Signing session not found." },
      { status: 404 },
    );
  }

  const synced = await syncEnvelopeFromDocuSignSafe(envelopeId, true);
  if (synced) record = synced;

  if (record.status === "completed") {
    const done = new URL("/docusign/ceo-complete", request.url);
    done.searchParams.set("track", track);
    done.searchParams.set("event", "signing_complete");
    return NextResponse.redirect(done);
  }

  if (record.status !== "investor_signed") {
    return NextResponse.json(
      { error: "Waiting for the investor to finish signing first." },
      { status: 409 },
    );
  }

  try {
    const base = new URL(request.url);
    const returnUrl = new URL("/docusign/ceo-complete", base.origin);
    returnUrl.searchParams.set("track", track);

    const docuSignUrl = await createCeoSigningViewUrl(
      envelopeId,
      returnUrl.toString(),
    );

    return NextResponse.redirect(docuSignUrl);
  } catch (err) {
    console.error("GET /api/docusign/ceo-redirect", err);
    const message = err instanceof Error ? err.message : "";
    const failed = new URL("/docusign/ceo-complete", request.url);
    failed.searchParams.set("track", track);
    if (/not a valid recipient/i.test(message)) {
      failed.searchParams.set("event", "recipient_mismatch");
    } else if (/ttl_expired|expired/i.test(message)) {
      failed.searchParams.set("event", "ttl_expired");
    } else {
      failed.searchParams.set("event", "session_failed");
    }
    return NextResponse.redirect(failed);
  }
}
