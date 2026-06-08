-- Repair admin roles for accounts created before role-based admin access.
-- Early versions stored admin access in portal_admins while portal_users.role stayed 'investor'.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'portal_admins'
  ) THEN
    UPDATE portal_users u
    SET role = 'admin'
    FROM portal_admins a
    WHERE a.user_id = u.id AND u.role <> 'admin';
  END IF;
END $$;
