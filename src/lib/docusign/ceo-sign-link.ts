import crypto from "crypto";
import type { OfferingType } from "@/lib/portal/db-types";
import { getAppBaseUrl } from "@/lib/docusign/config";

function linkSecret(): string {
  const secret =
    process.env.DOCUSIGN_CEO_LINK_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "Set DOCUSIGN_CEO_LINK_SECRET or AUTH_SECRET for CEO sign links.",
    );
  }
  return secret;
}

/** Stable HMAC token — does not expire; validated on each redirect. */
export function createCeoSignToken(envelopeId: string): string {
  return crypto
    .createHmac("sha256", linkSecret())
    .update(envelopeId)
    .digest("base64url");
}

export function verifyCeoSignToken(envelopeId: string, token: string): boolean {
  const expected = createCeoSignToken(envelopeId);
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

/** Portal link for email / copy — opens fresh DocuSign session on each click. */
export function buildCeoSignPortalUrl(
  envelopeId: string,
  track: OfferingType,
): string {
  const params = new URLSearchParams({
    track,
    envelope: envelopeId,
    token: createCeoSignToken(envelopeId),
  });
  return `${getAppBaseUrl()}/api/docusign/ceo-redirect?${params.toString()}`;
}
