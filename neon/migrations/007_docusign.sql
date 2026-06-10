-- DocuSign envelope tracking per investor + document.

CREATE TABLE IF NOT EXISTS docusign_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES portal_users (id) ON DELETE CASCADE,
  doc_id text NOT NULL,
  track text NOT NULL CHECK (track IN ('friends_family', 'private')),
  envelope_id text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (
    status IN ('sent', 'investor_signed', 'completed', 'declined', 'voided')
  ),
  investor_signed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, doc_id, track)
);

CREATE INDEX IF NOT EXISTS docusign_envelopes_user_track_idx
  ON docusign_envelopes (user_id, track);

CREATE INDEX IF NOT EXISTS docusign_envelopes_envelope_id_idx
  ON docusign_envelopes (envelope_id);
