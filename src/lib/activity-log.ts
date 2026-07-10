import type { LGUSession } from "@/lib/supabase/require-lgu-user";

export type LGUActivityAction = "upload" | "edit" | "delete" | "publish";

export type LGUActivityModule =
  | "ordinances"
  | "resolutions"
  | "minutes"
  | "committees"
  | "cso"
  | "sb_members"
  | "categories";

export type RecordActivityInput = {
  session: LGUSession;
  action: LGUActivityAction;
  module: LGUActivityModule;
  entityId?: string;
  entityTitle?: string;
  details: string;
};

export async function recordLGUActivity(
  input: RecordActivityInput
): Promise<void> {
  try {
    const { session, action, module, entityId, entityTitle, details } = input;

    await session.supabase.from("lgu_activity_logs").insert({
      lgu_id: session.lguId,
      user_id: session.userId,
      user_name: session.fullName || "Unknown User",
      action,
      module,
      entity_id: entityId ?? null,
      entity_title: entityTitle ?? null,
      details,
    });
  } catch {
    /* Activity logging must not block primary operations */
  }
}
