-- Per-track progress: F&F and Private are fully independent (route + step each).
-- Legacy current_route / current_step are no longer written by the portal.
ALTER TABLE investor_profiles
  ADD COLUMN IF NOT EXISTS ff_current_route text,
  ADD COLUMN IF NOT EXISTS ff_current_step integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS private_current_route text,
  ADD COLUMN IF NOT EXISTS private_current_step integer NOT NULL DEFAULT 2;

-- Migrate legacy single-track progress into the matching track column.
UPDATE investor_profiles
SET
  ff_current_route = COALESCE(ff_current_route, current_route),
  ff_current_step = COALESCE(NULLIF(ff_current_step, 2), current_step, 2)
WHERE offering_type = 'friends_family'
  AND current_route IS NOT NULL;

UPDATE investor_profiles
SET
  private_current_route = COALESCE(private_current_route, current_route),
  private_current_step = COALESCE(NULLIF(private_current_step, 2), current_step, 2)
WHERE offering_type = 'private'
  AND current_route IS NOT NULL;

-- Users who signed an NDA but have no saved route yet start at the first step.
UPDATE investor_profiles
SET ff_current_route = 'page2'
WHERE nda_signed_ff = true
  AND ff_current_route IS NULL;

UPDATE investor_profiles
SET private_current_route = 'pp_welcome_ceo'
WHERE nda_signed_private = true
  AND private_current_route IS NULL;
