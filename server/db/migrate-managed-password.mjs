import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const sql = fs.readFileSync(
  path.join(__dirname, "migrate-managed-password.sql"),
  "utf8"
);

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required. Copy `.env.example` to `.env` first.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });

try {
  await pool.query(sql);
  const col = await pool.query(
    `SELECT data_type, is_nullable
     FROM information_schema.columns
     WHERE table_name = 'profiles' AND column_name = 'managed_password'`
  );
  console.log("Migration applied:", col.rows);
} finally {
  await pool.end();
}
