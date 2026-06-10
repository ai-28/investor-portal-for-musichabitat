import type { OfferingType } from "@/lib/portal/db-types";
import { getSql } from "@/lib/db/client";

export type EnvelopeStatus =
  | "sent"
  | "investor_signed"
  | "completed"
  | "declined"
  | "voided";

export interface EnvelopeRow {
  id: string;
  user_id: string;
  doc_id: string;
  track: OfferingType;
  envelope_id: string;
  status: EnvelopeStatus;
  investor_signed_at: string | null;
  completed_at: string | null;
}

function mapRow(row: Record<string, unknown>): EnvelopeRow {
  return row as unknown as EnvelopeRow;
}

export async function getEnvelopeRecord(
  userId: string,
  track: OfferingType,
  docId: string,
): Promise<EnvelopeRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT *
    FROM docusign_envelopes
    WHERE user_id = ${userId}
      AND track = ${track}
      AND doc_id = ${docId}
    LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function listEnvelopeRecords(
  userId: string,
  track: OfferingType,
): Promise<EnvelopeRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT *
    FROM docusign_envelopes
    WHERE user_id = ${userId}
      AND track = ${track}
    ORDER BY created_at ASC
  `;
  return rows.map((row) => mapRow(row as Record<string, unknown>));
}

export async function getEnvelopeByDocuSignId(
  envelopeId: string,
): Promise<EnvelopeRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT *
    FROM docusign_envelopes
    WHERE envelope_id = ${envelopeId}
    LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function saveEnvelopeRecord(input: {
  userId: string;
  track: OfferingType;
  docId: string;
  envelopeId: string;
  status?: EnvelopeStatus;
}): Promise<EnvelopeRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO docusign_envelopes (user_id, doc_id, track, envelope_id, status)
    VALUES (
      ${input.userId},
      ${input.docId},
      ${input.track},
      ${input.envelopeId},
      ${input.status ?? "sent"}
    )
    ON CONFLICT (user_id, doc_id, track)
    DO UPDATE SET
      envelope_id = EXCLUDED.envelope_id,
      status = EXCLUDED.status,
      updated_at = now()
    RETURNING *
  `;
  return mapRow(rows[0] as Record<string, unknown>);
}

export async function updateEnvelopeStatus(
  envelopeId: string,
  status: EnvelopeStatus,
  timestamps?: { investorSignedAt?: Date; completedAt?: Date },
): Promise<EnvelopeRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE docusign_envelopes
    SET
      status = ${status},
      investor_signed_at = COALESCE(
        ${timestamps?.investorSignedAt?.toISOString() ?? null},
        investor_signed_at
      ),
      completed_at = COALESCE(
        ${timestamps?.completedAt?.toISOString() ?? null},
        completed_at
      ),
      updated_at = now()
    WHERE envelope_id = ${envelopeId}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}
