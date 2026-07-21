-- Run on existing databases (local / Droplet) that already applied schema.sql
CREATE TABLE IF NOT EXISTS district_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lgu_id uuid NOT NULL REFERENCES lgus (id) ON DELETE CASCADE,
  barangay_name text NOT NULL,
  sb_member_id uuid NOT NULL REFERENCES sb_members (id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT district_assignments_lgu_barangay_unique UNIQUE (lgu_id, barangay_name)
);

CREATE INDEX IF NOT EXISTS idx_district_assignments_lgu
  ON district_assignments (lgu_id);
