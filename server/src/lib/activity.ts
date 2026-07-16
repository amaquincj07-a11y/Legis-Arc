import { query } from "./db.js";

export type ActivityAction = "upload" | "edit" | "delete" | "publish";

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
    await query(
      `INSERT INTO lgu_activity_logs (
        lgu_id, user_id, user_name, action, module,
        entity_id, entity_title, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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
  } catch {
    /* never block primary ops */
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
