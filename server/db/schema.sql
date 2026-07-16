-- LegisArc self-hosted PostgreSQL schema (no Supabase Auth/Storage)
-- Applied automatically on first `docker compose up` via init volume.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE account_type AS ENUM ('company', 'lgu');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'sys_admin',
    'sb_secretary',
    'sb_member',
    'digitization_assistant'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lgu_status AS ENUM (
    'active',
    'paid',
    'pending',
    'suspended',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- LGUs
CREATE TABLE IF NOT EXISTS lgus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province text NOT NULL,
  municipality text NOT NULL,
  status lgu_status NOT NULL DEFAULT 'pending',
  subscription_amount numeric(12, 2) NOT NULL DEFAULT 100000,
  subscription_start_date timestamptz NOT NULL DEFAULT now(),
  subscription_end_date timestamptz NOT NULL,
  street_address text,
  support_plan text CHECK (support_plan IS NULL OR support_plan IN ('monthly', 'annual')),
  document_count integer NOT NULL DEFAULT 0,
  admin_full_name text NOT NULL,
  admin_position text NOT NULL,
  admin_office_email text NOT NULL,
  admin_mobile_number text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lgus_province_municipality_unique UNIQUE (province, municipality)
);

CREATE INDEX IF NOT EXISTS lgus_status_idx ON lgus (status);
CREATE INDEX IF NOT EXISTS lgus_location_idx ON lgus (province, municipality);

DROP TRIGGER IF EXISTS lgus_set_updated_at ON lgus;
CREATE TRIGGER lgus_set_updated_at
BEFORE UPDATE ON lgus
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Users / profiles (replaces Supabase auth.users + profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  account_type account_type NOT NULL,
  role user_role,
  lgu_id uuid REFERENCES lgus (id) ON DELETE SET NULL,
  full_name text NOT NULL,
  position text,
  mobile text,
  is_active boolean NOT NULL DEFAULT true,
  is_primary_admin boolean NOT NULL DEFAULT false,
  module_access text[] DEFAULT '{}',
  allowed_categories text[] DEFAULT '{}',
  managed_password text,
  password_reset_token_hash text,
  password_reset_expires_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_lgu_account_requires_lgu_id CHECK (
    (account_type = 'lgu' AND lgu_id IS NOT NULL)
    OR (account_type = 'company' AND lgu_id IS NULL)
  ),
  CONSTRAINT profiles_role_matches_account_type CHECK (
    (account_type = 'lgu' AND role IS NOT NULL)
    OR (account_type = 'company' AND role IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_idx ON profiles (lower(email));
CREATE INDEX IF NOT EXISTS profiles_lgu_id_idx ON profiles (lgu_id);
CREATE INDEX IF NOT EXISTS profiles_account_type_idx ON profiles (account_type);

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Document categories
CREATE TABLE IF NOT EXISTS document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lgu_id, name)
);

-- Ordinances
CREATE TABLE IF NOT EXISTS ordinances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  ordinance_number text NOT NULL,
  series_year integer NOT NULL,
  title text NOT NULL,
  author_sponsor text NOT NULL DEFAULT '',
  category text NOT NULL,
  ordinance_kind text NOT NULL DEFAULT 'municipal'
    CHECK (ordinance_kind IN ('municipal', 'appropriation')),
  pdf_storage_path text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  is_public boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lgu_id, series_year, ordinance_number)
);

CREATE INDEX IF NOT EXISTS ordinances_lgu_id_idx ON ordinances (lgu_id);

DROP TRIGGER IF EXISTS ordinances_updated_at ON ordinances;
CREATE TRIGGER ordinances_updated_at
BEFORE UPDATE ON ordinances
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Resolutions
CREATE TABLE IF NOT EXISTS resolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  resolution_number text NOT NULL,
  series_year integer NOT NULL,
  title text NOT NULL,
  author_sponsor text NOT NULL DEFAULT '',
  category text NOT NULL,
  pdf_storage_path text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  is_public boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lgu_id, series_year, resolution_number)
);

CREATE INDEX IF NOT EXISTS resolutions_lgu_id_idx ON resolutions (lgu_id);

DROP TRIGGER IF EXISTS resolutions_updated_at ON resolutions;
CREATE TRIGGER resolutions_updated_at
BEFORE UPDATE ON resolutions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Session minutes
CREATE TABLE IF NOT EXISTS session_minutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  session_date date NOT NULL,
  session_type text NOT NULL DEFAULT 'regular'
    CHECK (session_type IN ('regular', 'special')),
  pdf_storage_path text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  is_public boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_minutes_lgu_id_idx ON session_minutes (lgu_id);

DROP TRIGGER IF EXISTS session_minutes_updated_at ON session_minutes;
CREATE TRIGGER session_minutes_updated_at
BEFORE UPDATE ON session_minutes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- SB members
CREATE TABLE IF NOT EXISTS sb_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  name text NOT NULL,
  position_slot text,
  position text,
  image_storage_path text,
  committees text[] DEFAULT '{}',
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Committees
CREATE TABLE IF NOT EXISTS committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  name text NOT NULL,
  chairman_id uuid REFERENCES sb_members (id) ON DELETE SET NULL,
  vice_chairman_id uuid REFERENCES sb_members (id) ON DELETE SET NULL,
  member_ids uuid[] DEFAULT '{}',
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CSO
CREATE TABLE IF NOT EXISTS cso_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  name text NOT NULL,
  officer_name text,
  position text,
  term text,
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS lgu_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles (id) ON DELETE SET NULL,
  user_name text NOT NULL DEFAULT '',
  action text NOT NULL,
  module text NOT NULL DEFAULT '',
  entity_id uuid,
  entity_title text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Download logs
CREATE TABLE IF NOT EXISTS document_download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  document_id uuid NOT NULL,
  document_type text NOT NULL,
  document_number text NOT NULL DEFAULT '',
  document_title text NOT NULL DEFAULT '',
  document_category text NOT NULL DEFAULT '',
  requester_name text NOT NULL DEFAULT '',
  office_org text NOT NULL DEFAULT '',
  purpose text NOT NULL DEFAULT '',
  consent_agreed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Subscription periods (billing)
CREATE TABLE IF NOT EXISTS lgu_subscription_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
