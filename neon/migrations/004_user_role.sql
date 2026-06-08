-- Replace portal_admins join table with a role column on portal_users.

ALTER TABLE portal_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'investor'
  CHECK (role IN ('investor', 'admin'));

-- Migrate existing portal_admins rows (if 003 was applied).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'portal_admins'
  ) THEN
    UPDATE portal_users u
    SET role = 'admin'
    FROM portal_admins a
    WHERE a.user_id = u.id;

    DROP TABLE portal_admins;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS portal_users_role_idx ON portal_users (role);
