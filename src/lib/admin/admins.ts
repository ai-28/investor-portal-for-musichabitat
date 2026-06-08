import bcrypt from "bcryptjs";
import { getSql } from "@/lib/db/client";
import { getUserByEmail, createPortalUser } from "@/lib/auth/users";
import { isAdminEmail } from "@/lib/auth/admin-emails";

export interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
  /** True when role = admin in the database (removable via UI). */
  managed_in_portal: boolean;
  /** True when email is also listed in ADMIN_EMAILS. */
  in_env: boolean;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isAdminInDb(userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT 1 FROM portal_users WHERE id = ${userId} AND role = 'admin' LIMIT 1
  `;
  return rows.length > 0;
}

export async function isAdminUser(userId: string, email: string): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  return isAdminInDb(userId);
}

export async function listAdmins(): Promise<AdminUserRow[]> {
  const sql = getSql();
  const envEmails = new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

  const rows = await sql`
    SELECT id, email, created_at::text
    FROM portal_users
    WHERE role = 'admin'
    ORDER BY created_at ASC
  `;

  const seen = new Set<string>();
  const admins: AdminUserRow[] = [];

  for (const row of rows) {
    const r = row as { id: string; email: string; created_at: string };
    const normalized = normalizeEmail(r.email);
    seen.add(normalized);
    admins.push({
      id: r.id,
      email: r.email,
      created_at: r.created_at,
      managed_in_portal: true,
      in_env: envEmails.has(normalized),
    });
  }

  for (const email of envEmails) {
    if (seen.has(email)) continue;
    const user = await getUserByEmail(email);
    if (user) {
      admins.push({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        managed_in_portal: false,
        in_env: true,
      });
    }
  }

  return admins;
}

export async function addAdmin(email: string, password: string): Promise<AdminUserRow> {
  const normalized = normalizeEmail(email);
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  let user = await getUserByEmail(normalized);
  if (!user) {
    user = await createPortalUser(normalized, password, "admin");
  } else if (await isAdminUser(user.id, user.email)) {
    throw new Error("This user is already an admin.");
  } else {
    const sql = getSql();
    await sql`UPDATE portal_users SET role = 'admin' WHERE id = ${user.id}`;
  }

  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    managed_in_portal: true,
    in_env: isAdminEmail(user.email),
  };
}

export async function removeAdmin(
  targetUserId: string,
  currentUserId: string,
): Promise<void> {
  if (targetUserId === currentUserId) {
    throw new Error("You cannot remove your own admin access.");
  }

  const admins = await listAdmins();
  if (admins.length <= 1) {
    throw new Error("Cannot remove the last admin.");
  }

  const sql = getSql();
  const rows = await sql`
    SELECT email, role FROM portal_users WHERE id = ${targetUserId} LIMIT 1
  `;
  const target = rows[0] as { email: string; role: string } | undefined;

  if (!target || target.role !== "admin") {
    throw new Error(
      "This admin is only defined via ADMIN_EMAILS in the environment. Remove them from .env instead.",
    );
  }

  await sql`UPDATE portal_users SET role = 'investor' WHERE id = ${targetUserId}`;
}

export async function updateAdminProfile(
  userId: string,
  updates: { email?: string; password?: string; currentPassword?: string },
): Promise<{ email: string }> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash FROM portal_users WHERE id = ${userId} LIMIT 1
  `;
  const user = rows[0] as { id: string; email: string; password_hash: string } | undefined;
  if (!user) throw new Error("User not found.");

  const needsPasswordCheck = Boolean(updates.email || updates.password);
  if (needsPasswordCheck) {
    if (!updates.currentPassword) {
      throw new Error("Current password is required.");
    }
    const valid = await bcrypt.compare(updates.currentPassword, user.password_hash);
    if (!valid) throw new Error("Current password is incorrect.");
  }

  let newEmail = user.email;

  if (updates.email) {
    const normalized = normalizeEmail(updates.email);
    if (normalized !== user.email) {
      const existing = await getUserByEmail(normalized);
      if (existing && existing.id !== userId) {
        throw new Error("An account with this email already exists.");
      }
      await sql`UPDATE portal_users SET email = ${normalized} WHERE id = ${userId}`;
      await sql`
        UPDATE investor_profiles SET email = ${normalized} WHERE id = ${userId}
      `;
      newEmail = normalized;
    }
  }

  if (updates.password) {
    if (updates.password.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }
    const password_hash = await bcrypt.hash(updates.password, 12);
    await sql`UPDATE portal_users SET password_hash = ${password_hash} WHERE id = ${userId}`;
  }

  return { email: newEmail };
}
