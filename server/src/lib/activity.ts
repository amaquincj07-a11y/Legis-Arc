import { query } from "./db.js";

export type ActivityAction = "upload" | "edit" | "delete" | "publish";

/** Max rows retained per LGU (FIFO — oldest dropped when exceeded). */
export const MAX_ACTIVITY_LOGS_PER_LGU = 50;

async function pruneActivityLogs(lguId: string): Promise<void> {
  await query(
    `DELETE FROM lgu_activity_logs
     WHERE id IN (
       SELECT id FROM (
         SELECT id
         FROM lgu_activity_logs
         WHERE lgu_id = $1
         ORDER BY created_at DESC, id DESC
         OFFSET $2
       ) AS excess
     )`,
    [lguId, MAX_ACTIVITY_LOGS_PER_LGU]
  );
}

export async function recordActivity(input: {
  lguId: string;
  userId: string | null;
  userName: string;
  action: ActivityAction;
  module: string;
  entityId?: string | null;
  entityTitle?: string | null;
  details: string;
}): Promise<void> {
  try {
    // `details` is jsonb — store via to_jsonb(text) so plain strings insert correctly.
    await query(
      `INSERT INTO lgu_activity_logs (
        lgu_id, user_id, user_name, action, module,
        entity_id, entity_title, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, to_jsonb($8::text))`,
      [
        input.lguId,
        input.userId,
        input.userName,
        input.action,
        input.module,
        input.entityId ?? null,
        input.entityTitle ?? null,
        input.details,
      ]
    );
    // Keep only the newest 50 — drops the oldest when the 51st is added (FIFO).
    await pruneActivityLogs(input.lguId);
  } catch (error) {
    console.error("[recordActivity] failed to write activity log:", error);
  }
}

export async function bumpDocumentCount(
  lguId: string,
  delta: 1 | -1
): Promise<void> {
  await query(
    `UPDATE lgus
     SET document_count = GREATEST(0, document_count + $2)
     WHERE id = $1`,
    [lguId, delta]
  );
}
