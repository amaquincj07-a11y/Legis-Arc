import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(root, "..");

dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env"), override: true });

const sqlPath = path.join(root, "db/migrations/001_district_assignments.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(sql);
await client.end();
console.log("district_assignments table ready");
