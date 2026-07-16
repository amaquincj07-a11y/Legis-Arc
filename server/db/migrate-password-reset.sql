-- Password reset tokens (self-hosted; no Supabase Auth)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS password_reset_token_hash text,
  ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamptz;
