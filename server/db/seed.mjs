/**
 * Seed demo users into local Postgres.
 * Run: npm run db:seed --prefix server
 *
 * Demo accounts (default password: password123, override with SEED_PASSWORD)
 *   secretary@panglao.local  → LGU sb_secretary
 *   admin@legisarc.local     → company super-admin
 */
import bcrypt from "bcryptjs";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env"), override: true });

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required. Copy `.env.example` to `.env` first.");
  process.exit(1);
}

/** Local demo login password only (not a production secret). */
const SEED_PASSWORD = process.env.SEED_PASSWORD?.trim() || "password123";

const LGU_ID = "11111111-1111-1111-1111-111111111111";
const SECRETARY_ID = "22222222-2222-2222-2222-222222222222";
const COMPANY_ID = "33333333-3333-3333-3333-333333333333";

async function main() {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await pool.query(
    `
    INSERT INTO lgus (
      id, province, municipality, status, subscription_end_date,
      street_address, support_plan, admin_full_name, admin_position,
      admin_office_email, admin_mobile_number
    ) VALUES (
      $1, 'BOHOL', 'PANGLAO', 'active', now() + interval '1 year',
      'Poblacion, Panglao, Bohol', 'annual',
      'Maria Santos', 'SB Secretary', 'secretary@panglao.local', '09171234567'
    )
    ON CONFLICT (province, municipality) DO UPDATE SET
      status = EXCLUDED.status,
      admin_office_email = EXCLUDED.admin_office_email
    `,
    [LGU_ID]
  );

  await pool.query(
    `
    INSERT INTO profiles (
      id, email, password_hash, account_type, role, lgu_id,
      full_name, position, mobile, is_active, is_primary_admin, module_access
    ) VALUES (
      $1, $2, $3, 'lgu', 'sb_secretary', $4,
      'Maria Santos', 'SB Secretary', '09171234567', true, true,
      ARRAY['ordinances','resolutions','minutes','categories']
    )
    ON CONFLICT (id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      is_active = true,
      email = EXCLUDED.email,
      lgu_id = EXCLUDED.lgu_id
    `,
    [SECRETARY_ID, "secretary@panglao.local", passwordHash, LGU_ID]
  );

  await pool.query(
    `
    INSERT INTO profiles (
      id, email, password_hash, account_type, role, lgu_id,
      full_name, position, is_active, is_primary_admin
    ) VALUES (
      $1, $2, $3, 'company', NULL, NULL,
      'LegisArc Admin', 'System Administrator', true, false
    )
    ON CONFLICT (id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      is_active = true,
      email = EXCLUDED.email
    `,
    [COMPANY_ID, "admin@legisarc.local", passwordHash]
  );

  const defaultCategories = [
    "Administrative Matters",
    "Agriculture",
    "Budget",
    "Celebrations",
    "Coastal Management",
    "Education",
    "Environment",
    "Fees and Charges",
    "Franchise",
    "Health",
    "History and Heritage",
    "Information Technology",
    "Infrastructure",
    "Land Use / Zoning",
    "Loans and other Fiscal Matters",
    "MOA/MOU/Usufruct/Contracts & Agreements",
    "Monetary Aide and other requests",
    "Municipal Lots",
    "NGO/PO Accreditation",
    "Peace and Order",
    "Penal, Criminal and Regulatory",
    "Purok System",
    "Risk Reduction",
    "Sisterhood Agreement",
    "Sports / Amusement",
    "Taxes",
    "Tourism",
    "Traffic Matters",
    "Transportation",
    "Waterworks",
    "Women and Children / PWD / Senior Citizen",
  ];

  for (let i = 0; i < defaultCategories.length; i++) {
    await pool.query(
      `
      INSERT INTO document_categories (lgu_id, name, is_active, sort_order)
      VALUES ($1, $2, true, $3)
      ON CONFLICT (lgu_id, name) DO NOTHING
      `,
      [LGU_ID, defaultCategories[i], i]
    );
  }

  console.log("Seed complete.");
  console.log(`  LGU login:      secretary@panglao.local / ${SEED_PASSWORD}`);
  console.log(`  Company login:  admin@legisarc.local / ${SEED_PASSWORD}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
