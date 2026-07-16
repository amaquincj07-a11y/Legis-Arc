-- Demo seed (passwords set by server/db/seed.mjs after schema load)
-- This file only inserts the LGU; users are inserted by the seed script
-- so password hashes stay consistent with bcrypt.

INSERT INTO lgus (
  id,
  province,
  municipality,
  status,
  subscription_end_date,
  street_address,
  support_plan,
  admin_full_name,
  admin_position,
  admin_office_email,
  admin_mobile_number
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'BOHOL',
  'PANGLAO',
  'active',
  now() + interval '1 year',
  'Poblacion, Panglao, Bohol',
  'annual',
  'Maria Santos',
  'SB Secretary',
  'secretary@panglao.local',
  '09171234567'
) ON CONFLICT (province, municipality) DO NOTHING;
