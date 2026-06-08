import { DOCUSIGN } from "@/portal/data/doc-config";
import type { InvestorApp } from "@/portal/types";

export async function getDocusignSigningUrl(
  docId: string,
  app: InvestorApp,
): Promise<string> {
  if (!DOCUSIGN.enabled || !DOCUSIGN.createEnvelopeEndpoint) return "";
  try {
    const res = await fetch(DOCUSIGN.createEnvelopeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, investor: app }),
    });
    const data = await res.json();
    return data.url || "";
  } catch {
    return "";
  }
}
