-- Payment transactions for wire, ACH, and check funding flows.

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES portal_users (id) ON DELETE CASCADE,
  track text NOT NULL CHECK (track IN ('friends_family', 'private')),
  method text NOT NULL CHECK (method IN ('ach', 'wire', 'check')),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'succeeded', 'failed', 'returned')
  ),
  processor text NOT NULL DEFAULT 'manual' CHECK (processor IN ('stripe', 'manual')),
  processor_id text,
  wire_reference text,
  mandate_accepted_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_transactions_investor_idx
  ON payment_transactions (investor_id);

CREATE INDEX IF NOT EXISTS payment_transactions_status_idx
  ON payment_transactions (status);

CREATE INDEX IF NOT EXISTS payment_transactions_processor_id_idx
  ON payment_transactions (processor_id)
  WHERE processor_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_wire_reference_idx
  ON payment_transactions (wire_reference)
  WHERE wire_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION set_payment_transactions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE PROCEDURE set_payment_transactions_updated_at();
