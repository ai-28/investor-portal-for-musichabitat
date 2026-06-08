-- Guardian serial: unique numbers 1–35 for Circle 35 F&F close assignments.

CREATE UNIQUE INDEX IF NOT EXISTS investor_profiles_guardian_serial_uidx
  ON investor_profiles (guardian_serial)
  WHERE guardian_serial IS NOT NULL;

DO $$
BEGIN
  ALTER TABLE investor_profiles
    ADD CONSTRAINT guardian_serial_range
    CHECK (guardian_serial IS NULL OR guardian_serial BETWEEN 1 AND 35);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
