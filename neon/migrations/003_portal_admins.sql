-- Superseded by 004_user_role.sql (role column on portal_users).
-- Portal admins: DB-backed admin access (supplements ADMIN_EMAILS env bootstrap).

CREATE TABLE IF NOT EXISTS portal_admins (
  user_id uuid PRIMARY KEY REFERENCES portal_users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_admins_user_id_idx ON portal_admins (user_id);
