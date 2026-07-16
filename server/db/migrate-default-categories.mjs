/**
 * Ensure every LGU has the canonical default document categories.
 * Safe to re-run. Does not remove custom categories an LGU added.
 *
 * Run: node db/migrate-default-categories.mjs
 */
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

const DEFAULT_DOCUMENT_CATEGORIES = [
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

/** Older spaced names → current canonical names */
const RENAMES = [
  [
    "MOA / MOU / Usufruct / Contracts & Agreements",
    "MOA/MOU/Usufruct/Contracts & Agreements",
  ],
  ["NGO / PO Accreditation", "NGO/PO Accreditation"],
];

async function main() {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: lgus } = await client.query(`SELECT id FROM lgus`);
    let inserted = 0;
    let renamed = 0;

    for (const lgu of lgus) {
      for (const [from, to] of RENAMES) {
        const exists = await client.query(
          `SELECT 1 FROM document_categories WHERE lgu_id = $1 AND name = $2`,
          [lgu.id, to]
        );
        if (exists.rowCount > 0) continue;

        const result = await client.query(
          `UPDATE document_categories
           SET name = $3, updated_at = NOW()
           WHERE lgu_id = $1 AND name = $2`,
          [lgu.id, from, to]
        );
        if (result.rowCount > 0) {
          renamed += result.rowCount;
          await client.query(
            `UPDATE ordinances SET category = $3, updated_at = NOW()
             WHERE lgu_id = $1 AND category = $2`,
            [lgu.id, from, to]
          );
          await client.query(
            `UPDATE resolutions SET category = $3, updated_at = NOW()
             WHERE lgu_id = $1 AND category = $2`,
            [lgu.id, from, to]
          );
        }
      }

      for (let i = 0; i < DEFAULT_DOCUMENT_CATEGORIES.length; i++) {
        const name = DEFAULT_DOCUMENT_CATEGORIES[i];
        const result = await client.query(
          `
          INSERT INTO document_categories (lgu_id, name, is_active, sort_order)
          VALUES ($1, $2, true, $3)
          ON CONFLICT (lgu_id, name) DO NOTHING
          `,
          [lgu.id, name, i]
        );
        inserted += result.rowCount ?? 0;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Default categories migration complete. LGUs=${lgus.length}, inserted=${inserted}, renamed=${renamed}`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
