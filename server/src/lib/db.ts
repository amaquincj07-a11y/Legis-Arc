import pg from "pg";
import { env } from "../config/env.js";

const { Pool, types } = pg;

/**
 * Keep Postgres DATE as YYYY-MM-DD strings.
 * Default Date parsing uses local midnight; getUTC* then shifts the day
 * (e.g. Dec 1 in Asia/Manila → Nov 30) — breaks localhost offline demos.
 */
types.setTypeParser(types.builtins.DATE, (value) => value);

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await pool.query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function queryAll<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
