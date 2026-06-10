import { getAdminExclusions } from "@/lib/admin/admins";
import { getSql } from "@/lib/db/client";
import type { InvestorProfileRow } from "@/lib/portal/db-types";

export interface AdminInvestorRow {
  id: string;
  email: string;
  user_created_at: string;
  full_name: string | null;
  phone: string | null;
  offering_type: InvestorProfileRow["offering_type"];
  current_step: number | null;
  current_route: string | null;
  ff_current_step: number | null;
  ff_current_route: string | null;
  private_current_step: number | null;
  private_current_route: string | null;
  amount_cents: number | null;
  application_status: InvestorProfileRow["application_status"] | null;
  payment_status: InvestorProfileRow["payment_status"];
  private_payment_status: InvestorProfileRow["private_payment_status"];
  guardian_serial: number | null;
  nda_signed_ff: boolean | null;
  nda_signed_private: boolean | null;
  profile_updated_at: string | null;
}

function mapRow(row: Record<string, unknown>): AdminInvestorRow {
  return {
    id: row.id as string,
    email: row.email as string,
    user_created_at: row.user_created_at as string,
    full_name: (row.full_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    offering_type: (row.offering_type as AdminInvestorRow["offering_type"]) ?? null,
    current_step: row.current_step != null ? Number(row.current_step) : null,
    current_route: (row.current_route as string | null) ?? null,
    ff_current_step: row.ff_current_step != null ? Number(row.ff_current_step) : null,
    ff_current_route: (row.ff_current_route as string | null) ?? null,
    private_current_step:
      row.private_current_step != null ? Number(row.private_current_step) : null,
    private_current_route: (row.private_current_route as string | null) ?? null,
    amount_cents: row.amount_cents != null ? Number(row.amount_cents) : null,
    application_status:
      (row.application_status as AdminInvestorRow["application_status"]) ?? null,
    payment_status: (row.payment_status as AdminInvestorRow["payment_status"]) ?? null,
    private_payment_status:
      (row.private_payment_status as AdminInvestorRow["private_payment_status"]) ?? null,
    guardian_serial:
      row.guardian_serial != null ? Number(row.guardian_serial) : null,
    nda_signed_ff: row.nda_signed_ff != null ? Boolean(row.nda_signed_ff) : null,
    nda_signed_private:
      row.nda_signed_private != null ? Boolean(row.nda_signed_private) : null,
    profile_updated_at: (row.profile_updated_at as string | null) ?? null,
  };
}

function isExcludedAdmin(
  row: AdminInvestorRow,
  adminIds: Set<string>,
  adminEmails: Set<string>,
): boolean {
  return adminIds.has(row.id) || adminEmails.has(row.email.trim().toLowerCase());
}

export async function listInvestorsForAdmin(): Promise<AdminInvestorRow[]> {
  const { ids: adminIds, emails: adminEmails } = await getAdminExclusions();
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id,
      u.email,
      u.created_at::text AS user_created_at,
      p.full_name,
      p.phone,
      p.offering_type,
      p.current_step,
      p.current_route,
      p.ff_current_step,
      p.ff_current_route,
      p.private_current_step,
      p.private_current_route,
      p.amount_cents,
      p.application_status,
      p.payment_status,
      p.private_payment_status,
      p.guardian_serial,
      p.nda_signed_ff,
      p.nda_signed_private,
      p.updated_at::text AS profile_updated_at
    FROM portal_users u
    LEFT JOIN investor_profiles p ON p.id = u.id
    WHERE u.role = 'investor'
    ORDER BY u.created_at DESC
  `;
  return rows
    .map((r) => mapRow(r as Record<string, unknown>))
    .filter((r) => !isExcludedAdmin(r, adminIds, adminEmails));
}

export async function getInvestorForAdmin(
  userId: string,
): Promise<AdminInvestorRow | null> {
  const { ids: adminIds, emails: adminEmails } = await getAdminExclusions();
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id,
      u.email,
      u.created_at::text AS user_created_at,
      p.full_name,
      p.phone,
      p.offering_type,
      p.current_step,
      p.current_route,
      p.ff_current_step,
      p.ff_current_route,
      p.private_current_step,
      p.private_current_route,
      p.amount_cents,
      p.application_status,
      p.payment_status,
      p.private_payment_status,
      p.guardian_serial,
      p.nda_signed_ff,
      p.nda_signed_private,
      p.updated_at::text AS profile_updated_at
    FROM portal_users u
    LEFT JOIN investor_profiles p ON p.id = u.id
    WHERE u.id = ${userId} AND u.role = 'investor'
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const row = mapRow(rows[0] as Record<string, unknown>);
  if (isExcludedAdmin(row, adminIds, adminEmails)) return null;
  return row;
}
