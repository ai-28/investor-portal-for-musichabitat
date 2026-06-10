import fs from "fs";
import path from "path";
import type { OfferingType } from "@/lib/portal/db-types";
import {
  DOCUSIGN_CEO_EMAIL,
  DOCUSIGN_CEO_NAME,
  SIGNING_DOC_LABELS,
  signingPdfFilename,
} from "@/lib/docusign/config";
import { DOCUSIGN_ENVELOPE_MODE_VERSION } from "@/lib/docusign/signing-field-guide";
import { docuSignFetch, getDocuSignAccountId } from "@/lib/docusign/client";
import {
  getEnvelopeRecord,
  getEnvelopeByDocuSignId,
  saveEnvelopeRecord,
  type EnvelopeRow,
} from "@/lib/docusign/store";

const lastSyncAt = new Map<string, number>();
const SYNC_COOLDOWN_MS = 60_000;

function isRateLimitError(message: string): boolean {
  return /hourly limit|polling calls|rate limit/i.test(message);
}

/** Throttled DocuSign sync; falls back to DB row on rate limits. */
export async function syncEnvelopeFromDocuSignSafe(
  envelopeId: string,
  force = false,
): Promise<EnvelopeRow | null> {
  const cached = await getEnvelopeByDocuSignId(envelopeId);
  const now = Date.now();
  if (!force && cached) {
    const last = lastSyncAt.get(envelopeId) ?? 0;
    if (now - last < SYNC_COOLDOWN_MS) return cached;
  }

  try {
    lastSyncAt.set(envelopeId, now);
    return await syncEnvelopeFromDocuSign(envelopeId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (isRateLimitError(message)) {
      console.warn("DocuSign rate limit — using cached envelope status");
      return cached;
    }
    throw err;
  }
}

function readPdfBase64(filename: string): string {
  const filePath = path.join(process.cwd(), "public", "assets", "docs", filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Signing PDF not found: ${filename}`);
  }
  return fs.readFileSync(filePath).toString("base64");
}

async function voidEnvelope(envelopeId: string): Promise<void> {
  const accountId = getDocuSignAccountId();
  await docuSignFetch(`/v2.1/accounts/${accountId}/envelopes/${envelopeId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: "voided",
      voidedReason: "Recreating envelope with updated signing mode.",
    }),
  });
}

export async function resendPendingRecipientNotifications(
  envelopeId: string,
): Promise<void> {
  const accountId = getDocuSignAccountId();
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${envelopeId}?resend_envelope=true`,
    { method: "PUT", body: JSON.stringify({}) },
  );
  if (!res.ok) {
    const data = (await res.json()) as { message?: string };
    console.warn(
      "DocuSign resend notification failed:",
      data.message ?? res.statusText,
    );
  }
}

export async function downloadCombinedDocument(
  envelopeId: string,
): Promise<{ buffer: Buffer; filename: string }> {
  const accountId = getDocuSignAccountId();
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/combined`,
    { headers: { Accept: "application/pdf" } },
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || "Could not download signed document.");
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const disposition = res.headers.get("content-disposition") ?? "";
  const nameMatch = disposition.match(/filename="?([^";\n]+)"?/i);
  return {
    buffer,
    filename: nameMatch?.[1]?.trim() || "signed-document.pdf",
  };
}

async function createEnvelope(params: {
  userId: string;
  investorEmail: string;
  investorName: string;
  pdfFilename: string;
  docLabel: string;
}): Promise<string> {
  const accountId = getDocuSignAccountId();
  const body = {
    emailSubject: `Music Habitat — ${params.docLabel}`,
    emailBlurb:
      "Go to the last page (Signature Page). Use Add Fields to place Signature, Date, and Text on each labeled line in your column, then Finish. The CEO countersigns via email after you complete.",
    status: "sent",
    customFields: {
      textCustomFields: [
        {
          name: "envelopeModeVersion",
          value: String(DOCUSIGN_ENVELOPE_MODE_VERSION),
          show: "false",
        },
      ],
    },
    documents: [
      {
        documentBase64: readPdfBase64(params.pdfFilename),
        name: params.docLabel,
        fileExtension: "pdf",
        documentId: "1",
      },
    ],
    recipients: {
      signers: [
        {
          email: params.investorEmail,
          name: params.investorName,
          recipientId: "1",
          routingOrder: "1",
          clientUserId: params.userId,
        },
        {
          email: DOCUSIGN_CEO_EMAIL,
          name: DOCUSIGN_CEO_NAME,
          recipientId: "2",
          routingOrder: "2",
          emailNotification: {
            emailSubject: `Countersign required — ${params.docLabel}`,
            emailBody:
              "The investor has completed their fields. Open this email, go to the Signature Page, add Signature / Date / Text on the COMPANY column lines, then Finish.",
            supportedLanguage: "en",
          },
        },
      ],
    },
  };

  const res = await docuSignFetch(`/v2.1/accounts/${accountId}/envelopes`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { envelopeId?: string; message?: string };
  if (!res.ok || !data.envelopeId) {
    throw new Error(data.message || "DocuSign envelope creation failed.");
  }
  return data.envelopeId;
}

async function createEmbeddedSigningUrl(params: {
  envelopeId: string;
  userId: string;
  investorEmail: string;
  investorName: string;
  returnUrl: string;
}): Promise<string> {
  const accountId = getDocuSignAccountId();
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${params.envelopeId}/views/recipient`,
    {
      method: "POST",
      body: JSON.stringify({
        returnUrl: params.returnUrl,
        authenticationMethod: "none",
        email: params.investorEmail,
        userName: params.investorName,
        clientUserId: params.userId,
        recipientId: "1",
      }),
    },
  );
  const data = (await res.json()) as { url?: string; message?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.message || "DocuSign signing URL failed.");
  }
  return data.url;
}

export async function startSigningSession(params: {
  userId: string;
  investorEmail: string;
  investorName: string;
  docId: string;
  track: OfferingType;
  returnUrl: string;
}): Promise<{ url: string; envelopeId: string; status: string }> {
  const pdfFilename = signingPdfFilename(params.track, params.docId);
  if (!pdfFilename) {
    throw new Error(
      `No signing PDF is configured for document "${params.docId}".`,
    );
  }

  const docLabel =
    SIGNING_DOC_LABELS[params.docId] ?? params.docId.replace(/_/g, " ");

  let record: EnvelopeRow | null = await getEnvelopeRecord(
    params.userId,
    params.track,
    params.docId,
  );

  // Recreate in-progress envelopes (fixed-tab era) so the next session uses freeform.
  if (record && record.status === "sent") {
    try {
      await voidEnvelope(record.envelope_id);
    } catch {
      /* envelope may already be void or unavailable */
    }
    record = null;
  }

  if (!record) {
    const envelopeId = await createEnvelope({
      userId: params.userId,
      investorEmail: params.investorEmail,
      investorName: params.investorName,
      pdfFilename,
      docLabel,
    });
    record = await saveEnvelopeRecord({
      userId: params.userId,
      track: params.track,
      docId: params.docId,
      envelopeId,
      status: "sent",
    });
  }

  if (record.status === "completed") {
    return {
      url: "",
      envelopeId: record.envelope_id,
      status: record.status,
    };
  }

  const url = await createEmbeddedSigningUrl({
    envelopeId: record.envelope_id,
    userId: params.userId,
    investorEmail: params.investorEmail,
    investorName: params.investorName,
    returnUrl: params.returnUrl,
  });

  return {
    url,
    envelopeId: record.envelope_id,
    status: record.status,
  };
}

interface DocuSignSigner {
  recipientId?: string;
  status?: string;
}

export async function syncEnvelopeFromDocuSign(
  envelopeId: string,
): Promise<EnvelopeRow | null> {
  const accountId = getDocuSignAccountId();
  const previous = await getEnvelopeByDocuSignId(envelopeId);
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${envelopeId}?include=recipients`,
  );
  const envelope = (await res.json()) as {
    status?: string;
    recipients?: { signers?: DocuSignSigner[] };
    message?: string;
  };

  if (!res.ok) {
    const message = envelope.message || "Failed to sync DocuSign envelope.";
    if (isRateLimitError(message)) {
      return getEnvelopeByDocuSignId(envelopeId);
    }
    throw new Error(message);
  }

  const recipients = envelope.recipients?.signers ?? [];
  const investor = recipients.find((r) => r.recipientId === "1");
  const ceo = recipients.find((r) => r.recipientId === "2");

  const investorDone =
    investor?.status === "completed" || investor?.status === "signed";
  const ceoDone = ceo?.status === "completed" || ceo?.status === "signed";
  const envelopeDone = envelope.status === "completed";

  let status: EnvelopeRow["status"] = "sent";
  if (envelope.status === "declined") status = "declined";
  else if (envelope.status === "voided") status = "voided";
  else if (envelopeDone || (investorDone && ceoDone)) status = "completed";
  else if (investorDone) status = "investor_signed";

  const { updateEnvelopeStatus } = await import("@/lib/docusign/store");
  const updated = await updateEnvelopeStatus(envelopeId, status, {
    investorSignedAt: investorDone ? new Date() : undefined,
    completedAt: status === "completed" ? new Date() : undefined,
  });

  if (
    updated &&
    status === "investor_signed" &&
    previous?.status === "sent"
  ) {
    await resendPendingRecipientNotifications(envelopeId);
  }

  return updated;
}
