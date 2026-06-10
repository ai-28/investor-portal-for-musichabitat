import crypto from "crypto";
import type { OfferingType } from "@/lib/portal/db-types";
import { getProfile, updateProfile } from "@/lib/portal/profile";
import {
  getEnvelopeByDocuSignId,
  type EnvelopeStatus,
} from "@/lib/docusign/store";
import { syncEnvelopeFromDocuSign, syncEnvelopeFromDocuSignSafe } from "@/lib/docusign/envelopes";

export function verifyDocuSignWebhook(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.DOCUSIGN_CONNECT_HMAC_KEY?.trim();
  if (!secret) return true;
  if (!signatureHeader) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const digest = hmac.digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(digest),
    );
  } catch {
    return false;
  }
}

function extractEnvelopeId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;

  if (typeof data.envelopeId === "string") return data.envelopeId;

  const nested = data.data as Record<string, unknown> | undefined;
  if (typeof nested?.envelopeId === "string") return nested.envelopeId;

  const summary = nested?.envelopeSummary as Record<string, unknown> | undefined;
  if (typeof summary?.envelopeId === "string") return summary.envelopeId;

  const legacy = data.EnvelopeStatus as Record<string, unknown> | undefined;
  if (typeof legacy?.EnvelopeID === "string") return legacy.EnvelopeID;

  return null;
}

function extractEvent(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const data = payload as Record<string, unknown>;
  if (typeof data.event === "string") return data.event;
  if (typeof data.Event === "string") return data.Event;
  return "";
}

async function applySignedDocs(
  userId: string,
  email: string,
  track: OfferingType,
  docId: string,
  completed: boolean,
): Promise<void> {
  if (!completed) return;

  const profile = await getProfile(userId);
  const signedKey = track === "private" ? "psigned" : "signed";
  const existing =
    track === "private"
      ? ((profile?.private_signed ?? {}) as Record<string, boolean>)
      : ((profile?.signed_docs ?? {}) as Record<string, boolean>);

  const nextSigned = { ...existing, [docId]: true };
  const allDocIds = ["safe", "warrant", "subscription"];

  const allDone = allDocIds.every((id) => nextSigned[id]);

  await updateProfile(userId, email, {
    ...(signedKey === "psigned"
      ? { psigned: nextSigned }
      : { signed: nextSigned }),
    ...(allDone
      ? track === "private"
        ? { private_application_status: "signed" }
        : { application_status: "signed" }
      : {}),
  });
}

export async function handleDocuSignWebhookPayload(
  payload: unknown,
): Promise<void> {
  const envelopeId = extractEnvelopeId(payload);
  if (!envelopeId) return;

  const record = await getEnvelopeByDocuSignId(envelopeId);
  if (!record) {
    await syncEnvelopeFromDocuSign(envelopeId);
    return;
  }

  const synced = await syncEnvelopeFromDocuSign(envelopeId);
  if (!synced) return;

  const event = extractEvent(payload).toLowerCase();
  const completed =
    synced.status === "completed" ||
    event.includes("envelope-completed") ||
    event.includes("envelope_complete");

  const profile = await getProfile(synced.user_id);
  if (!profile?.email) return;

  await applySignedDocs(
    synced.user_id,
    profile.email,
    synced.track,
    synced.doc_id,
    completed,
  );
}

export async function refreshTrackSigningState(
  userId: string,
  email: string,
  track: OfferingType,
  docIds: string[],
  options?: { sync?: boolean },
): Promise<{
  signed: Record<string, boolean>;
  statuses: Record<string, EnvelopeStatus | "pending">;
}> {
  const { listEnvelopeRecords } = await import("@/lib/docusign/store");
  const records = await listEnvelopeRecords(userId, track);
  const byDoc = new Map(records.map((r) => [r.doc_id, r]));

  const signed: Record<string, boolean> = {};
  const statuses: Record<string, EnvelopeStatus | "pending"> = {};

  for (const docId of docIds) {
    let record = byDoc.get(docId);
    if (options?.sync && record && record.status !== "completed") {
      const synced = await syncEnvelopeFromDocuSignSafe(record.envelope_id, true);
      if (synced) record = synced;
    }

    statuses[docId] = record?.status ?? "pending";
    signed[docId] = record?.status === "completed";

    if (record?.status === "completed") {
      await applySignedDocs(userId, email, track, docId, true);
    }
  }

  return { signed, statuses };
}
