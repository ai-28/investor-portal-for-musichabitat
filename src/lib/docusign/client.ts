import { createSign } from "crypto";
import { getDocuSignBasePath, readDocuSignPrivateKey } from "@/lib/docusign/config";

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

function oauthHost(): string {
  const base = getDocuSignBasePath();
  return base.includes("demo") || base.includes("account-d")
    ? "https://account-d.docusign.com"
    : "https://account.docusign.com";
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createJwt(integrationKey: string, userId: string, privateKey: string): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({
      iss: integrationKey,
      sub: userId,
      aud: oauthHost().replace("https://", ""),
      iat: now,
      exp: now + 3600,
      scope: "signature impersonation",
    }),
  );
  const data = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  sign.end();
  const signature = sign
    .sign(privateKey)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${data}.${signature}`;
}

export async function getDocuSignAccessToken(): Promise<string> {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const userId = process.env.DOCUSIGN_USER_ID;
  if (!integrationKey || !userId) {
    throw new Error("DocuSign integration key or user id is not configured.");
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const assertion = createJwt(integrationKey, userId, readDocuSignPrivateKey());
  const res = await fetch(`${oauthHost()}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "DocuSign JWT auth failed.",
    );
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

export function getDocuSignAccountId(): string {
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID?.trim();
  if (!accountId) throw new Error("DOCUSIGN_ACCOUNT_ID is not configured.");
  return accountId;
}

export async function docuSignFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getDocuSignAccessToken();
  const base = getDocuSignBasePath().replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}
