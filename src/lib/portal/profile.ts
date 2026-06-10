import type {
  InvestorProfileRow,
  OfferingType,
  PortalStatePatch,
} from "@/lib/portal/db-types";
import { patchToRowUpdate } from "@/lib/portal/state";
import { getSql } from "@/lib/db/client";
import { getUserById } from "@/lib/auth/users";

export class SessionUserNotFoundError extends Error {
  constructor() {
    super("SESSION_USER_NOT_FOUND");
    this.name = "SessionUserNotFoundError";
  }
}

function mapProfileRow(row: Record<string, unknown>): InvestorProfileRow {
  return row as unknown as InvestorProfileRow;
}

export async function getProfile(userId: string): Promise<InvestorProfileRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT *
    FROM investor_profiles
    WHERE id = ${userId}
    LIMIT 1
  `;
  return rows[0] ? mapProfileRow(rows[0] as Record<string, unknown>) : null;
}

export async function ensureProfile(
  userId: string,
  email: string,
  offeringType?: OfferingType,
): Promise<InvestorProfileRow> {
  const existing = await getProfile(userId);
  if (existing) {
    if (offeringType && !existing.offering_type) {
      const sql = getSql();
      const rows = await sql`
        UPDATE investor_profiles
        SET offering_type = ${offeringType}
        WHERE id = ${userId}
        RETURNING *
      `;
      return mapProfileRow(rows[0] as Record<string, unknown>);
    }
    return existing;
  }

  const portalUser = await getUserById(userId);
  if (!portalUser) {
    throw new SessionUserNotFoundError();
  }

  const sql = getSql();
  const rows = await sql`
    INSERT INTO investor_profiles (id, email, offering_type, current_step)
    VALUES (${userId}, ${email}, ${offeringType ?? null}, 2)
    RETURNING *
  `;
  return mapProfileRow(rows[0] as Record<string, unknown>);
}

export async function updateProfile(
  userId: string,
  email: string,
  patch: PortalStatePatch,
): Promise<InvestorProfileRow> {
  const existing = await ensureProfile(userId, email, patch.offering_type);
  const rowUpdate = patchToRowUpdate(patch, existing);

  if (Object.keys(rowUpdate).length === 0) {
    return existing;
  }

  const merged: InvestorProfileRow = { ...existing, ...rowUpdate };
  const sql = getSql();

  const rows = await sql`
    UPDATE investor_profiles SET
      email = ${merged.email},
      full_name = ${merged.full_name},
      phone = ${merged.phone},
      offering_type = ${merged.offering_type},
      referrer_id = ${merged.referrer_id},
      referrer_rejected = ${merged.referrer_rejected},
      current_step = ${merged.current_step},
      current_route = ${merged.current_route},
      ff_current_step = ${merged.ff_current_step},
      ff_current_route = ${merged.ff_current_route},
      private_current_step = ${merged.private_current_step},
      private_current_route = ${merged.private_current_route},
      amount_cents = ${merged.amount_cents},
      accredited_confirmed = ${merged.accredited_confirmed},
      application_status = ${merged.application_status},
      payment_status = ${merged.payment_status},
      guardian_serial = ${merged.guardian_serial},
      read_docs = ${merged.read_docs},
      acknowledgments = ${merged.acknowledgments},
      signed_docs = ${merged.signed_docs},
      nda_signed_ff = ${merged.nda_signed_ff},
      nda_signed_private = ${merged.nda_signed_private},
      nda_signer_name = ${merged.nda_signer_name},
      nda_signed_ff_at = ${merged.nda_signed_ff_at},
      nda_signed_private_at = ${merged.nda_signed_private_at},
      private_app = ${merged.private_app},
      private_acks = ${merged.private_acks},
      private_signed = ${merged.private_signed},
      private_application_status = ${merged.private_application_status},
      private_payment_status = ${merged.private_payment_status}
    WHERE id = ${userId}
    RETURNING *
  `;

  return mapProfileRow(rows[0] as Record<string, unknown>);
}
