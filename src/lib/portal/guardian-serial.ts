import { getSql } from "@/lib/db/client";
import type { InvestorProfileRow } from "@/lib/portal/db-types";

export { guardianSerialToRoman } from "@/lib/portal/guardian-serial-format";

const MAX_GUARDIANS = 35;

async function nextAvailableSerial(): Promise<number | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT n AS serial
    FROM generate_series(1, ${MAX_GUARDIANS}) AS n
    WHERE n NOT IN (
      SELECT guardian_serial
      FROM investor_profiles
      WHERE guardian_serial IS NOT NULL
    )
    ORDER BY n
    LIMIT 1
  `;
  const serial = (rows[0] as { serial: number } | undefined)?.serial;
  return serial ?? null;
}

export async function closeFriendsFamilyInvestor(
  userId: string,
): Promise<InvestorProfileRow> {
  const sql = getSql();
  const existing = await sql`
    SELECT *
    FROM investor_profiles
    WHERE id = ${userId}
    LIMIT 1
  `;
  const profile = existing[0] as InvestorProfileRow | undefined;
  if (!profile) {
    throw new Error("Investor profile not found.");
  }
  if (profile.offering_type !== "friends_family") {
    throw new Error("Guardian serial applies to Friends & Family investors only.");
  }
  if (profile.guardian_serial != null) {
    throw new Error("This investor already has a Guardian serial assigned.");
  }

  const serial = await nextAvailableSerial();
  if (serial == null) {
    throw new Error("Circle 35 is full — all 35 Guardian serials are assigned.");
  }

  const updated = await sql`
    UPDATE investor_profiles
    SET
      guardian_serial = ${serial},
      application_status = 'complete',
      payment_status = COALESCE(payment_status, 'cleared')
    WHERE id = ${userId}
      AND offering_type = 'friends_family'
      AND guardian_serial IS NULL
    RETURNING *
  `;

  if (!updated[0]) {
    throw new Error("Could not assign Guardian serial. Try again.");
  }

  return updated[0] as InvestorProfileRow;
}
