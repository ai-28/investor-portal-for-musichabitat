import bcrypt from "bcryptjs";
import { getSql } from "@/lib/db/client";

export type PortalUserRole = "investor" | "admin";

export interface PortalUserRow {
  id: string;
  email: string;
  password_hash: string;
  role: PortalUserRole;
  created_at: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(email: string): Promise<PortalUserRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash, role, created_at::text
    FROM portal_users
    WHERE email = ${normalizeEmail(email)}
    LIMIT 1
  `;
  return (rows[0] as PortalUserRow | undefined) ?? null;
}

export async function createPortalUser(
  email: string,
  password: string,
  role: PortalUserRole = "investor",
): Promise<PortalUserRow> {
  const normalized = normalizeEmail(email);
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const existing = await getUserByEmail(normalized);
  if (existing) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();
  const sql = getSql();

  const rows = await sql`
    INSERT INTO portal_users (id, email, password_hash, role)
    VALUES (${id}, ${normalized}, ${password_hash}, ${role})
    RETURNING id, email, password_hash, role, created_at::text
  `;

  return rows[0] as PortalUserRow;
}
