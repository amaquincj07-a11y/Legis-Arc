-- Convert managed_password from boolean flag → plaintext reference (company admin view).
-- Safe to re-run.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'managed_password'
      AND data_type = 'boolean'
  ) THEN
    ALTER TABLE profiles
      ALTER COLUMN managed_password DROP DEFAULT;

    ALTER TABLE profiles
      ALTER COLUMN managed_password DROP NOT NULL;

    ALTER TABLE profiles
      ALTER COLUMN managed_password TYPE text
      USING NULL;
  END IF;
END $$;
