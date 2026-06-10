import { NextResponse } from "next/server";
import { isDocuSignConfigured } from "@/lib/docusign/config";
import { getDocuSignAccessToken } from "@/lib/docusign/client";

/** Verifies JWT auth + consent without creating an envelope. */
export async function GET() {
  if (!isDocuSignConfigured()) {
    return NextResponse.json(
      { ok: false, error: "DocuSign is not configured." },
      { status: 503 },
    );
  }

  try {
    await getDocuSignAccessToken();
    return NextResponse.json({
      ok: true,
      message:
        "JWT auth succeeded. Consent is already granted — go to Step 10 and click Sign.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "JWT auth failed.";
    const needsConsent =
      /consent_required|consent required/i.test(message) ||
      message.includes("consent");

    return NextResponse.json(
      {
        ok: false,
        needsConsent,
        error: message,
        hint: needsConsent
          ? "Open /api/docusign/config and use consentUrl while logged in as the API user."
          : "Check DOCUSIGN_USER_ID, RSA private key, and account id.",
      },
      { status: needsConsent ? 403 : 500 },
    );
  }
}
