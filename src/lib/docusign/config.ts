import type { OfferingType } from "@/lib/portal/db-types";

export const DOCUSIGN_CEO_EMAIL =
  process.env.DOCUSIGN_CEO_EMAIL?.trim() || "brandon@musichabitat.com";

export const DOCUSIGN_CEO_NAME =
  process.env.DOCUSIGN_CEO_NAME?.trim() || "Brandon Beard";

import fs from "fs";
import path from "path";

export function canReadDocuSignPrivateKey(): boolean {
  if (process.env.DOCUSIGN_RSA_PRIVATE_KEY?.trim()) return true;

  const keyPath = process.env.DOCUSIGN_RSA_PRIVATE_KEY_PATH?.trim();
  if (!keyPath) return false;

  const resolved = path.isAbsolute(keyPath)
    ? keyPath
    : path.join(process.cwd(), keyPath);
  return fs.existsSync(resolved);
}

export function isDocuSignConfigured(): boolean {
  return Boolean(
    process.env.DOCUSIGN_INTEGRATION_KEY &&
      process.env.DOCUSIGN_USER_ID &&
      process.env.DOCUSIGN_ACCOUNT_ID &&
      canReadDocuSignPrivateKey(),
  );
}

export function getDocuSignBasePath(): string {
  const raw =
    process.env.DOCUSIGN_BASE_PATH?.trim() ||
    process.env.DOCUSIGN_BASE_URL?.trim() ||
    "https://demo.docusign.net/restapi";
  const normalized = raw.replace(/\/$/, "");
  return normalized.endsWith("/restapi") ? normalized : `${normalized}/restapi`;
}

export function readDocuSignPrivateKey(): string {
  const inline = process.env.DOCUSIGN_RSA_PRIVATE_KEY?.trim();
  if (inline) return inline.replace(/\\n/g, "\n");

  const keyPath = process.env.DOCUSIGN_RSA_PRIVATE_KEY_PATH?.trim();
  if (keyPath) {
    const resolved = path.isAbsolute(keyPath)
      ? keyPath
      : path.join(process.cwd(), keyPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`DocuSign private key file not found: ${resolved}`);
    }
    return fs.readFileSync(resolved, "utf8");
  }

  throw new Error(
    "Set DOCUSIGN_RSA_PRIVATE_KEY or DOCUSIGN_RSA_PRIVATE_KEY_PATH.",
  );
}

export function getAppBaseUrl(): string {
  const url =
    process.env.NEXTAUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!url) {
    throw new Error("NEXTAUTH_URL is not configured.");
  }
  return url.replace(/\/$/, "");
}

/** Must exactly match a Redirect URI registered in DocuSign Apps and Keys. */
export function getDocuSignOAuthRedirectUri(): string {
  const configured = process.env.DOCUSIGN_OAUTH_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${getAppBaseUrl()}/docusign/oauth/callback`;
}

export function getDocuSignConsentUrl(): string {
  const clientId = process.env.DOCUSIGN_INTEGRATION_KEY?.trim();
  if (!clientId) throw new Error("DOCUSIGN_INTEGRATION_KEY is not configured.");
  const redirectUri = encodeURIComponent(getDocuSignOAuthRedirectUri());
  const host = getDocuSignBasePath().includes("demo")
    ? "account-d.docusign.com"
    : "account.docusign.com";
  return (
    `https://${host}/oauth/auth?response_type=code` +
    `&scope=signature%20impersonation` +
    `&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}`
  );
}

/** PDF filenames under public/assets/docs for each signing doc id. */
export const SIGNING_PDF_FILES: Record<
  OfferingType,
  Record<string, string>
> = {
  friends_family: {
    safe: "MusicHabitat SAFE Private506c.pdf",
    warrant: "MusicHabitat Warrant Private506c.pdf",
    subscription: "MusicHabitat Subscription Private506c.pdf",
  },
  private: {
    safe: "MusicHabitat SAFE Private506c.pdf",
    warrant: "MusicHabitat Warrant Private506c.pdf",
    subscription: "MusicHabitat Subscription Private506c.pdf",
  },
};

export function signingPdfFilename(
  track: OfferingType,
  docId: string,
): string | null {
  return SIGNING_PDF_FILES[track]?.[docId] ?? null;
}

export const SIGNING_DOC_LABELS: Record<string, string> = {
  safe: "SAFE Agreement",
  warrant: "Warrant Agreement",
  subscription: "Subscription Agreement & Questionnaire",
  p_stockpurchase: "Stock Purchase & Transfer Agreement",
  p_subscription: "Subscription Agreement & Investor Questionnaire",
  p_stockholders: "Stockholders' Agreement",
};
