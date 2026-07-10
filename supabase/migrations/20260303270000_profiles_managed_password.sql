-- App-managed password copy so admins can view the current login password
-- with an eye toggle. This is a plaintext convenience field for admin-created
-- accounts; Supabase Auth still stores the real hashed password separately.

alter table public.profiles
  add column if not exists managed_password text;

-- Backfill primary-admin managed_password reference from the lgus admin fields
-- is not possible (passwords are not stored on lgus). New/edited accounts will
-- populate this column going forward via the app.
