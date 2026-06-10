import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  getDocuSignConsentUrl,
  getDocuSignOAuthRedirectUri,
  canReadDocuSignPrivateKey,
  isDocuSignConfigured,
} from "@/lib/docusign/config";

export async function GET() {
  const keyPath = process.env.DOCUSIGN_RSA_PRIVATE_KEY_PATH?.trim();
  const keyFileExists = keyPath
    ? fs.existsSync(
        path.isAbsolute(keyPath)
          ? keyPath
          : path.join(process.cwd(), keyPath),
      )
    : false;

  let consentUrl: string | null = null;
  if (isDocuSignConfigured()) {
    try {
      consentUrl = getDocuSignConsentUrl();
    } catch {
      consentUrl = null;
    }
  }

  return NextResponse.json({
    enabled: isDocuSignConfigured(),
    consentUrl,
    redirectUri: getDocuSignOAuthRedirectUri(),
    checks: {
      integrationKey: Boolean(process.env.DOCUSIGN_INTEGRATION_KEY),
      userId: Boolean(process.env.DOCUSIGN_USER_ID),
      accountId: Boolean(process.env.DOCUSIGN_ACCOUNT_ID),
      privateKeyInline: Boolean(process.env.DOCUSIGN_RSA_PRIVATE_KEY),
      privateKeyPath: Boolean(keyPath),
      privateKeyFileExists: keyFileExists,
      privateKeyReadable: canReadDocuSignPrivateKey(),
      nextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
      vercelUrl: Boolean(process.env.VERCEL_URL),
    },
  });
}
