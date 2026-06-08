-- =============================================================================
-- Neon Postgres — full investor portal schema
-- Run once in Neon SQL Editor (or psql) on a fresh database.
-- Auth: NextAuth credentials (portal_users). Data: investor_profiles.
-- =============================================================================

CREATE TABLE IF NOT EXISTS portal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'investor' CHECK (role IN ('investor', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_users_email_idx ON portal_users (email);
CREATE INDEX IF NOT EXISTS portal_users_role_idx ON portal_users (role);

CREATE TABLE IF NOT EXISTS investor_profiles (
  id uuid PRIMARY KEY REFERENCES portal_users (id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  offering_type text CHECK (offering_type IN ('friends_family', 'private')),
  referrer_id text,
  referrer_rejected boolean NOT NULL DEFAULT false,
  current_step integer NOT NULL DEFAULT 2 CHECK (current_step BETWEEN 1 AND 13),
  current_route text,
  amount_cents integer CHECK (amount_cents IS NULL OR amount_cents >= 50000),
  accredited_confirmed boolean NOT NULL DEFAULT false,
  application_status text NOT NULL DEFAULT 'draft' CHECK (
    application_status IN ('draft', 'submitted', 'signed', 'funded', 'complete')
  ),
  payment_status text CHECK (
    payment_status IS NULL
    OR payment_status IN ('pending', 'authorized', 'cleared', 'failed')
  ),
  guardian_serial integer,
  read_docs jsonb NOT NULL DEFAULT '{}'::jsonb,
  acknowledgments jsonb NOT NULL DEFAULT '{}'::jsonb,
  signed_docs jsonb NOT NULL DEFAULT '{}'::jsonb,
  nda_signed_ff boolean NOT NULL DEFAULT false,
  nda_signed_private boolean NOT NULL DEFAULT false,
  nda_signer_name text,
  nda_signed_ff_at timestamptz,
  nda_signed_private_at timestamptz,
  private_app jsonb NOT NULL DEFAULT '{}'::jsonb,
  private_acks jsonb NOT NULL DEFAULT '{}'::jsonb,
  private_signed jsonb NOT NULL DEFAULT '{}'::jsonb,
  private_application_status text NOT NULL DEFAULT 'draft' CHECK (
    private_application_status IN ('draft', 'submitted', 'signed', 'funded', 'complete')
  ),
  private_payment_status text CHECK (
    private_payment_status IS NULL
    OR private_payment_status IN ('pending', 'authorized', 'cleared', 'failed')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS investor_profiles_email_idx ON investor_profiles (email);
CREATE INDEX IF NOT EXISTS investor_profiles_offering_type_idx ON investor_profiles (offering_type);

CREATE OR REPLACE FUNCTION set_investor_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS investor_profiles_updated_at ON investor_profiles;
CREATE TRIGGER investor_profiles_updated_at
  BEFORE UPDATE ON investor_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE set_investor_profiles_updated_at();
