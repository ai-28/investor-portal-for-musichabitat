import type { InvestorApp, PrivateApp, SignedMap } from "@/portal/types";
import type { OfferingType } from "@/lib/portal/db-types";

export async function startDocusignSession(
  docId: string,
  track: OfferingType,
  investor?: Pick<InvestorApp | PrivateApp, "fullName" | "email">,
): Promise<{ url: string; status: string }> {
  const res = await fetch("/api/docusign/envelope", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docId, track, investor }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Could not start DocuSign session.");
  }
  return data;
}

/** @deprecated Use startDocusignSession via useSigningFlow */
export async function getDocusignSigningUrl(
  docId: string,
  app: Pick<InvestorApp, "fullName" | "email">,
): Promise<string> {
  try {
    const data = await startDocusignSession(docId, "friends_family", app);
    return data.url || "";
  } catch {
    return "";
  }
}

export type { SignedMap };
