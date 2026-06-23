import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/portal/profile";
import { isDocuSignConfigured, getAppBaseUrl } from "@/lib/docusign/config";
import { startSigningSession } from "@/lib/docusign/envelopes";
import type { OfferingType } from "@/lib/portal/db-types";

export async function POST(request: Request) {
  if (!isDocuSignConfigured()) {
    return NextResponse.json(
      { error: "DocuSign is not configured on this server." },
      { status: 503 },
    );
  }

  try {
    const user = await requireSessionUser();
    const body = (await request.json()) as {
      docId?: string;
      track?: OfferingType;
      investor?: { fullName?: string; email?: string };
    };

    const docId = body.docId?.trim();
    const track = body.track;
    if (!docId || (track !== "friends_family" && track !== "private")) {
      return NextResponse.json({ error: "Invalid signing request." }, { status: 400 });
    }

    await ensureProfile(user.id, user.email, track);

    const investorName =
      body.investor?.fullName?.trim() ||
      user.email.split("@")[0] ||
      "Investor";
    const investorEmail = body.investor?.email?.trim() || user.email;

    const returnPath =
      docId === "nda"
        ? track === "private"
          ? "/nda/private"
          : "/nda/friends-family"
        : track === "private"
          ? "/private/sign"
          : "/step/10";
    const returnUrl = `${getAppBaseUrl()}${returnPath}?docusign=done&doc=${encodeURIComponent(docId)}`;

    const session = await startSigningSession({
      userId: user.id,
      investorEmail,
      investorName,
      docId,
      track,
      returnUrl,
    });

    return NextResponse.json(session);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/docusign/envelope", err);
    const message =
      err instanceof Error ? err.message : "Failed to start DocuSign session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
