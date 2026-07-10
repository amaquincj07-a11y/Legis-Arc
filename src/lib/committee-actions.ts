"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import {
  COMMITTEE_SELECT,
  mapCommitteeRowToCommittee,
  type CommitteeRow,
} from "@/lib/supabase/committee-mapper";
import { recordLGUActivity } from "@/lib/activity-log";
import { createClient } from "@/lib/supabase/server";
import { requireLGUSession } from "@/lib/supabase/require-lgu-user";
import type { Committee, SBMember, SBMemberPositionSlot } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const SB_MEMBER_LOOKUP_SELECT = "id, name, position_slot, position";

type SBMemberLookupRow = {
  id: string;
  name: string;
  position_slot: SBMemberPositionSlot;
  position: string;
};

function toActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function mapLookupRowToMember(row: SBMemberLookupRow): SBMember {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    positionSlot: row.position_slot,
    yearTerm: "",
    committees: [],
  };
}

async function fetchSBMemberLookupMap(
  supabase: SupabaseServerClient,
  lguId: string
): Promise<Map<string, SBMember>> {
  const { data, error } = await supabase
    .from("sb_members")
    .select(SB_MEMBER_LOOKUP_SELECT)
    .eq("lgu_id", lguId);

  if (error || !data) return new Map();

  const members = (data as SBMemberLookupRow[]).map(mapLookupRowToMember);
  return new Map(members.map((member) => [member.id, member]));
}

function parseMemberIds(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => String(value).trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function validateMemberIds(
  supabase: SupabaseServerClient,
  lguId: string,
  ids: string[]
): Promise<boolean> {
  if (ids.length === 0) return true;

  const { data, error } = await supabase
    .from("sb_members")
    .select("id")
    .eq("lgu_id", lguId)
    .in("id", ids);

  if (error || !data) return false;
  return data.length === ids.length;
}

async function validateLeaderId(
  supabase: SupabaseServerClient,
  lguId: string,
  id: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("sb_members")
    .select("id")
    .eq("lgu_id", lguId)
    .eq("id", id)
    .maybeSingle();

  return !error && Boolean(data);
}

function safeRevalidateCommittees() {
  try {
    revalidatePath("/admin/committees");
    revalidatePath("/admin/sb-members");
  } catch {
    /* static export — no cache to revalidate */
  }
}

export type CommitteesPageData = {
  committees: Committee[];
  sbMembers: SBMember[];
};

export async function fetchCommitteesPageDataAction(): Promise<
  ActionResult<CommitteesPageData>
> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const memberById = await fetchSBMemberLookupMap(
      session.supabase,
      session.lguId
    );

    const { data, error: queryError } = await session.supabase
      .from("committees")
      .select(COMMITTEE_SELECT)
      .eq("lgu_id", session.lguId)
      .order("name", { ascending: true });

    if (queryError) {
      return { success: false, error: queryError.message };
    }

    const committees = ((data ?? []) as CommitteeRow[]).map((row) =>
      mapCommitteeRowToCommittee(row, memberById)
    );

    const sbMembers = [...memberById.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return { success: true, data: { committees, sbMembers } };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load committees."),
    };
  }
}

export async function fetchCommitteesAction(): Promise<
  ActionResult<Committee[]>
> {
  const result = await fetchCommitteesPageDataAction();
  if (!result.success) return result;
  return { success: true, data: result.data.committees };
}

export type CommitteeFormData = {
  id: string;
  name: string;
  chairmanId: string;
  viceChairmanId: string;
  memberIds: string[];
};

export async function fetchCommitteeDetailAction(
  id: string
): Promise<ActionResult<CommitteeFormData>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { data, error: queryError } = await session.supabase
      .from("committees")
      .select(COMMITTEE_SELECT)
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .maybeSingle();

    if (queryError) {
      return { success: false, error: queryError.message };
    }
    if (!data) {
      return { success: false, error: "Committee not found." };
    }

    const row = data as CommitteeRow;
    return {
      success: true,
      data: {
        id: row.id,
        name: row.name,
        chairmanId: row.chairman_id,
        viceChairmanId: row.vice_chairman_id,
        memberIds: Array.isArray(row.member_ids) ? row.member_ids : [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load committee details."),
    };
  }
}

export async function fetchCommitteeSBMembersAction(): Promise<
  ActionResult<SBMember[]>
> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const memberById = await fetchSBMemberLookupMap(
      session.supabase,
      session.lguId
    );
    const members = [...memberById.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return { success: true, data: members };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load SB members."),
    };
  }
}

export async function createCommitteeAction(
  formData: FormData
): Promise<ActionResult<Committee>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const name = String(formData.get("name") ?? "").trim();
    const chairmanId = String(formData.get("chairmanId") ?? "").trim();
    const viceChairmanId = String(formData.get("viceChairmanId") ?? "").trim();
    const memberIds = parseMemberIds(formData.get("memberIds"));

    if (!name) {
      return { success: false, error: "Please enter the committee title." };
    }
    if (!chairmanId) {
      return { success: false, error: "Please select a Chairman." };
    }
    if (!viceChairmanId) {
      return { success: false, error: "Please select a Vice-Chairman." };
    }

    const chairmanValid = await validateLeaderId(
      session.supabase,
      session.lguId,
      chairmanId
    );
    const viceValid = await validateLeaderId(
      session.supabase,
      session.lguId,
      viceChairmanId
    );
    const membersValid = await validateMemberIds(
      session.supabase,
      session.lguId,
      memberIds
    );

    if (!chairmanValid || !viceValid) {
      return {
        success: false,
        error: "Selected leadership must be from your SB Members roster.",
      };
    }
    if (!membersValid) {
      return {
        success: false,
        error: "One or more selected members are invalid.",
      };
    }

    const committeeId = randomUUID();

    const { data, error: insertError } = await session.supabase
      .from("committees")
      .insert({
        id: committeeId,
        lgu_id: session.lguId,
        name,
        chairman_id: chairmanId,
        vice_chairman_id: viceChairmanId,
        member_ids: memberIds,
        created_by: session.userId,
      })
      .select(COMMITTEE_SELECT)
      .single();

    if (insertError || !data) {
      return {
        success: false,
        error: insertError?.message ?? "Failed to add committee.",
      };
    }

    const memberById = await fetchSBMemberLookupMap(
      session.supabase,
      session.lguId
    );
    safeRevalidateCommittees();
    await recordLGUActivity({
      session,
      action: "upload",
      module: "committees",
      entityId: committeeId,
      entityTitle: name,
      details: `Added committee "${name}"`,
    });
    return {
      success: true,
      data: mapCommitteeRowToCommittee(data as CommitteeRow, memberById),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to add committee."),
    };
  }
}

export async function updateCommitteeAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Committee>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const name = String(formData.get("name") ?? "").trim();
    const chairmanId = String(formData.get("chairmanId") ?? "").trim();
    const viceChairmanId = String(formData.get("viceChairmanId") ?? "").trim();
    const memberIds = parseMemberIds(formData.get("memberIds"));

    if (!name) {
      return { success: false, error: "Please enter the committee title." };
    }
    if (!chairmanId) {
      return { success: false, error: "Please select a Chairman." };
    }
    if (!viceChairmanId) {
      return { success: false, error: "Please select a Vice-Chairman." };
    }

    const chairmanValid = await validateLeaderId(
      session.supabase,
      session.lguId,
      chairmanId
    );
    const viceValid = await validateLeaderId(
      session.supabase,
      session.lguId,
      viceChairmanId
    );
    const membersValid = await validateMemberIds(
      session.supabase,
      session.lguId,
      memberIds
    );

    if (!chairmanValid || !viceValid) {
      return {
        success: false,
        error: "Selected leadership must be from your SB Members roster.",
      };
    }
    if (!membersValid) {
      return {
        success: false,
        error: "One or more selected members are invalid.",
      };
    }

    const { data, error: updateError } = await session.supabase
      .from("committees")
      .update({
        name,
        chairman_id: chairmanId,
        vice_chairman_id: viceChairmanId,
        member_ids: memberIds,
      })
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .select(COMMITTEE_SELECT)
      .single();

    if (updateError || !data) {
      return {
        success: false,
        error: updateError?.message ?? "Failed to update committee.",
      };
    }

    const memberById = await fetchSBMemberLookupMap(
      session.supabase,
      session.lguId
    );
    safeRevalidateCommittees();
    await recordLGUActivity({
      session,
      action: "edit",
      module: "committees",
      entityId: id,
      entityTitle: name,
      details: `Updated committee "${name}"`,
    });
    return {
      success: true,
      data: mapCommitteeRowToCommittee(data as CommitteeRow, memberById),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to update committee."),
    };
  }
}

export async function deleteCommitteeAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { data: existing, error: fetchError } = await session.supabase
      .from("committees")
      .select("name")
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: "Committee not found." };
    }

    const { error: deleteError } = await session.supabase
      .from("committees")
      .delete()
      .eq("id", id)
      .eq("lgu_id", session.lguId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    safeRevalidateCommittees();
    await recordLGUActivity({
      session,
      action: "delete",
      module: "committees",
      entityId: id,
      entityTitle: existing.name as string,
      details: `Deleted committee "${existing.name}"`,
    });
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to delete committee."),
    };
  }
}
