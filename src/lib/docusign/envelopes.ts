import fs from "fs";
import path from "path";
import type { OfferingType } from "@/lib/portal/db-types";
import {
  DOCUSIGN_CEO_CLIENT_USER_ID,
  DOCUSIGN_CEO_EMAIL,
  DOCUSIGN_CEO_NAME,
  SIGNING_DOC_LABELS,
  getAppBaseUrl,
  resolveSigningPdfPath,
} from "@/lib/docusign/config";
import { sendNdaCountersignEmails } from "@/lib/email/send";
import { buildCeoSignPortalUrl } from "@/lib/docusign/ceo-sign-link";
import { applySignedDocs } from "@/lib/docusign/signing-profile";
import { getProfile } from "@/lib/portal/profile";
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

/** Prevents duplicate CEO/investor emails when sync + notify race or double API calls. */
const investorSignedNotifyAt = new Map<string, number>();
const INVESTOR_SIGNED_NOTIFY_COOLDOWN_MS = 15 * 60 * 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLockError(text: string): boolean {
  return /EDIT_LOCK_NOT_LOCK_OWNER|envelope is locked/i.test(text);
}

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

function readPdfBase64(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Signing PDF not found: ${filePath}`);
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

async function getEnvelopeModeVersion(envelopeId: string): Promise<string | null> {
  const accountId = getDocuSignAccountId();
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/custom_fields`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    textCustomFields?: Array<{ name?: string; value?: string }>;
  };
  const field = data.textCustomFields?.find((f) => f.name === "envelopeModeVersion");
  return field?.value ?? null;
}

async function releaseEnvelopeLockIfOwned(envelopeId: string): Promise<void> {
  const accountId = getDocuSignAccountId();
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/locks`,
  );
  if (!res.ok) return;

  const lock = (await res.json()) as { lockToken?: string };
  if (!lock.lockToken) return;

  await docuSignFetch(`/v2.1/accounts/${accountId}/envelopes/${envelopeId}/locks`, {
    method: "DELETE",
    headers: {
      "X-DocuSign-Edit": JSON.stringify({ lockToken: lock.lockToken }),
    },
  });
}

/** Resend to pending recipients via envelope update (no recipient PUT — avoids edit locks). */
export async function resendPendingRecipientNotifications(
  envelopeId: string,
): Promise<boolean> {
  const accountId = getDocuSignAccountId();
  const maxAttempts = 6;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(2000 * attempt);
      await releaseEnvelopeLockIfOwned(envelopeId);
    }

    const res = await docuSignFetch(
      `/v2.1/accounts/${accountId}/envelopes/${envelopeId}?resend_envelope=true`,
      { method: "PUT", body: JSON.stringify({}) },
    );

    if (res.ok) {
      console.info("DocuSign envelope notification resent:", envelopeId);
      return true;
    }

    const text = await res.text();
    if (isLockError(text) && attempt < maxAttempts - 1) {
      console.warn(
        `DocuSign envelope locked, retrying notification (${attempt + 1}/${maxAttempts})…`,
      );
      continue;
    }

    console.error(
      "DocuSign envelope resend failed:",
      res.status,
      text.slice(0, 500),
    );
    return false;
  }

  return false;
}

interface DocuSignSigner {
  recipientId?: string;
  status?: string;
  email?: string;
  name?: string;
  routingOrder?: string;
  clientUserId?: string;
}

function recipientSummary(signers: DocuSignSigner[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of signers) {
    if (!s.recipientId) continue;
    out[s.recipientId] = `${s.status ?? "unknown"} (${s.email ?? "no-email"})`;
  }
  return out;
}

/** Fetch live DocuSign recipient rows for diagnostics. */
export async function fetchEnvelopeRecipientSummary(
  envelopeId: string,
): Promise<{
  envelopeStatus: string;
  recipients: Record<string, string>;
  signers: DocuSignSigner[];
}> {
  const accountId = getDocuSignAccountId();
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${envelopeId}?include=recipients`,
  );
  const envelope = (await res.json()) as {
    status?: string;
    recipients?: { signers?: DocuSignSigner[] };
    message?: string;
  };
  if (!res.ok) {
    throw new Error(envelope.message || "Could not load envelope recipients.");
  }
  const signers = envelope.recipients?.signers ?? [];
  return {
    envelopeStatus: envelope.status ?? "unknown",
    recipients: recipientSummary(signers),
    signers,
  };
}

/** CEO-only resend after investor signs (remote signer — needs recipient PUT once lock clears). */
async function resendCeoCountersignNotification(
  envelopeId: string,
  ceo: DocuSignSigner | undefined,
): Promise<boolean> {
  if (!ceo?.email || !ceo.name || !ceo.recipientId) return false;

  const accountId = getDocuSignAccountId();
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(4000);
      await releaseEnvelopeLockIfOwned(envelopeId);
    }

    const res = await docuSignFetch(
      `/v2.1/accounts/${accountId}/envelopes/${envelopeId}/recipients?resend_envelope=true`,
      {
        method: "PUT",
        body: JSON.stringify({
          signers: [
            {
              recipientId: ceo.recipientId,
              email: ceo.email,
              name: ceo.name,
              routingOrder: ceo.routingOrder ?? "2",
            },
          ],
        }),
      },
    );

    if (res.ok) {
      console.info("DocuSign CEO countersign email resent to:", ceo.email);
      return true;
    }

    const text = await res.text();
    if (isLockError(text) && attempt < maxAttempts - 1) {
      console.warn(
        `DocuSign CEO resend locked, retrying (${attempt + 1}/${maxAttempts})…`,
      );
      continue;
    }

    console.error("DocuSign CEO resend failed:", res.status, text.slice(0, 500));
    return false;
  }

  return false;
}

async function notifyAfterInvestorSigned(
  envelopeId: string,
  docLabel: string,
  investor: DocuSignSigner | undefined,
  ceo: DocuSignSigner | undefined,
  options?: { force?: boolean },
): Promise<void> {
  const now = Date.now();
  const last = investorSignedNotifyAt.get(envelopeId);
  if (
    !options?.force &&
    last &&
    now - last < INVESTOR_SIGNED_NOTIFY_COOLDOWN_MS
  ) {
    console.info(
      "Skipping duplicate investor-signed notifications for:",
      envelopeId,
    );
    return;
  }
  investorSignedNotifyAt.set(envelopeId, now);

  await sleep(3000);

  const record = await getEnvelopeByDocuSignId(envelopeId);
  if (!record) return;

  try {
    const portalUrl = `${getAppBaseUrl()}${signingPortalReturnPath(record.track, record.doc_id)}`;
    const ceoSignUrl = buildCeoSignPortalUrl(envelopeId, record.track);
    const appEmails = await sendNdaCountersignEmails({
      investorEmail: investor?.email,
      ceoEmail: ceo?.email ?? DOCUSIGN_CEO_EMAIL,
      ceoSignUrl,
      docLabel,
      portalUrl,
    });
    if (!appEmails.ceo && !appEmails.investor) {
      console.warn(
        "DocuSign resend succeeded but no app email sent. Set RESEND_API_KEY or use the CEO countersign link from the portal.",
      );
    }
  } catch (err) {
    console.error("NDA countersign email/link failed:", err);
  }
}

async function notifyEnvelopeCompleted(
  envelopeId: string,
  _docLabel: string,
  _investor: DocuSignSigner | undefined,
  _ceo: DocuSignSigner | undefined,
): Promise<void> {
  // Completion notifications via envelope resend (avoids edit-lock errors).
  await resendPendingRecipientNotifications(envelopeId);
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
  pdfPath: string;
  docLabel: string;
  docId: string;
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
        documentBase64: readPdfBase64(params.pdfPath),
        name: params.docLabel,
        fileExtension: "pdf",
        documentId: "1",
      },
    ],
    notification: {
      useAccountDefaults: "true",
    },
    recipients: {
      signers: [
        {
          email: params.investorEmail,
          name: params.investorName,
          recipientId: "1",
          routingOrder: "1",
          deliveryMethod: "email",
          clientUserId: params.userId,
          embeddedRecipientStartURL: "SIGN_AT_DOCUSIGN",
          suppressEmails: "false",
          documentDelivery: {
            documentDeliveryMethod: "email",
            email: params.investorEmail,
          },
        },
        {
          email: DOCUSIGN_CEO_EMAIL,
          name: DOCUSIGN_CEO_NAME,
          recipientId: "2",
          routingOrder: "2",
          deliveryMethod: "email",
          clientUserId: DOCUSIGN_CEO_CLIENT_USER_ID,
          embeddedRecipientStartURL: "SIGN_AT_DOCUSIGN",
          suppressEmails: "false",
          documentDelivery: {
            documentDeliveryMethod: "email",
            email: DOCUSIGN_CEO_EMAIL,
          },
          emailNotification: {
            emailSubject: `Countersign required — ${params.docLabel}`,
            emailBody:
              "The investor has completed their fields. Open this email, go to the Signature Page, use Add Fields to place Signature / Date / Text on the Music Habitat column (left), then Finish.",
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

function ndaReturnPath(track: OfferingType): string {
  return track === "private" ? "/nda/private" : "/nda/friends-family";
}

function signingPortalReturnPath(track: OfferingType, docId: string): string {
  if (docId === "nda") return ndaReturnPath(track);
  if (track === "private") return "/private/sign";
  return "/step/10";
}

/** Signing URL for a recipient (embedded when clientUserId is set). */
export async function createRemoteRecipientViewUrl(params: {
  envelopeId: string;
  recipientId: string;
  email: string;
  name: string;
  returnUrl: string;
  clientUserId?: string;
}): Promise<string> {
  const accountId = getDocuSignAccountId();
  const embedded = Boolean(params.clientUserId);
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${params.envelopeId}/views/recipient`,
    {
      method: "POST",
      body: JSON.stringify({
        returnUrl: params.returnUrl,
        authenticationMethod: embedded ? "none" : "email",
        email: params.email,
        userName: params.name,
        recipientId: params.recipientId,
        ...(embedded ? { clientUserId: params.clientUserId } : {}),
      }),
    },
  );
  const data = (await res.json()) as { url?: string; message?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.message || "DocuSign signing URL failed.");
  }
  return data.url;
}

/** CEO signing view — matches envelope recipient (embedded vs remote). */
export async function createCeoSigningViewUrl(
  envelopeId: string,
  returnUrl: string,
): Promise<string> {
  const { signers } = await fetchEnvelopeRecipientSummary(envelopeId);
  const ceo = signers.find((r) => r.recipientId === "2");
  if (!ceo?.email || !ceo.name) {
    throw new Error("CEO signer not found on this envelope.");
  }

  const recipientId = ceo.recipientId ?? "2";
  const base = {
    envelopeId,
    returnUrl,
    email: ceo.email,
    name: ceo.name,
    recipientId,
  };

  const embeddedClientId = ceo.clientUserId ?? DOCUSIGN_CEO_CLIENT_USER_ID;
  try {
    return await createRemoteRecipientViewUrl({
      ...base,
      clientUserId: embeddedClientId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!/not a valid recipient/i.test(message)) throw err;
    console.warn("CEO embedded view failed, retrying remote:", message);
    return createRemoteRecipientViewUrl(base);
  }
}

export async function createCeoCountersignUrl(
  envelopeId: string,
  track: OfferingType,
): Promise<string> {
  return createCeoSigningViewUrl(
    envelopeId,
    `${getAppBaseUrl()}/docusign/ceo-complete?track=${track}`,
  );
}

export async function startSigningSession(params: {
  userId: string;
  investorEmail: string;
  investorName: string;
  docId: string;
  track: OfferingType;
  returnUrl: string;
}): Promise<{ url: string; envelopeId: string; status: string }> {
  const pdfPath = resolveSigningPdfPath(params.track, params.docId);
  if (!pdfPath) {
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

  if (
    record &&
    record.status !== "completed" &&
    record.status !== "declined" &&
    record.status !== "voided"
  ) {
    const envVersion = await getEnvelopeModeVersion(record.envelope_id);
    if (envVersion !== String(DOCUSIGN_ENVELOPE_MODE_VERSION)) {
      try {
        await voidEnvelope(record.envelope_id);
      } catch {
        /* envelope may already be void or unavailable */
      }
      record = null;
    }
  }

  // Recreate in-progress envelopes so the next session uses the latest signing mode.
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
      pdfPath,
      docLabel,
      docId: params.docId,
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

  const record = updated ?? previous;
  const docLabel =
    record
      ? (SIGNING_DOC_LABELS[record.doc_id] ?? record.doc_id.replace(/_/g, " "))
      : "Document";

  if (
    updated &&
    status === "investor_signed" &&
    previous?.status !== "investor_signed"
  ) {
    await notifyAfterInvestorSigned(envelopeId, docLabel, investor, ceo);
  }

  if (
    updated &&
    status === "completed" &&
    previous?.status !== "completed"
  ) {
    await notifyEnvelopeCompleted(envelopeId, docLabel, investor, ceo);

    const profile = await getProfile(updated.user_id);
    if (profile?.email) {
      await applySignedDocs(
        updated.user_id,
        profile.email,
        updated.track,
        updated.doc_id,
        true,
      );
    }
  }

  return updated;
}

/** Re-send notifications after investor returns from signing (sync handles normal flow). */
export async function forceNotifySigningParties(
  envelopeId: string,
  options?: { force?: boolean },
): Promise<void> {
  const accountId = getDocuSignAccountId();
  const record = await getEnvelopeByDocuSignId(envelopeId);
  const res = await docuSignFetch(
    `/v2.1/accounts/${accountId}/envelopes/${envelopeId}?include=recipients`,
  );
  const envelope = (await res.json()) as {
    status?: string;
    recipients?: { signers?: DocuSignSigner[] };
    message?: string;
  };
  if (!res.ok) {
    console.error(
      "DocuSign notify fetch failed:",
      envelope.message ?? res.statusText,
    );
    return;
  }

  const recipients = envelope.recipients?.signers ?? [];
  const investor = recipients.find((r) => r.recipientId === "1");
  const ceo = recipients.find((r) => r.recipientId === "2");
  const docLabel = record
    ? (SIGNING_DOC_LABELS[record.doc_id] ?? record.doc_id.replace(/_/g, " "))
    : "Document";

  const investorDone =
    investor?.status === "completed" || investor?.status === "signed";
  const ceoDone = ceo?.status === "completed" || ceo?.status === "signed";
  const envelopeDone = envelope.status === "completed";

  let status: EnvelopeRow["status"] = "sent";
  if (envelope.status === "declined") status = "declined";
  else if (envelope.status === "voided") status = "voided";
  else if (envelopeDone || (investorDone && ceoDone)) status = "completed";
  else if (investorDone) status = "investor_signed";

  if (status === "investor_signed") {
    await notifyAfterInvestorSigned(
      envelopeId,
      docLabel,
      investor,
      ceo,
      options,
    );
  } else if (status === "completed") {
    await notifyEnvelopeCompleted(envelopeId, docLabel, investor, ceo);
    if (record) {
      const profile = await getProfile(record.user_id);
      if (profile?.email) {
        await applySignedDocs(
          record.user_id,
          profile.email,
          record.track,
          record.doc_id,
          true,
        );
      }
    }
  }
}
