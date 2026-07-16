"use server";

import { revalidatePath } from "next/cache";
import {
  apiGetAuth,
  apiPostAuth,
  apiPatchAuth,
  apiDeleteAuth,
} from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  mapCommitteeRowToCommittee,
  type CommitteeRow,
} from "@/lib/mappers/committee-mapper";
import {
  mapSBMemberRowToMember,
  type SBMemberRow,
} from "@/lib/mappers/sb-member-mapper";
import type { Committee, SBMember } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CommitteesPageData = {
  committees: Committee[];
  sbMembers: SBMember[];
};

export type CommitteeDetail = {
  name: string;
  chairmanId: string;
  viceChairmanId: string;
  memberIds: string[];
};

function formDataToCommitteeBody(formData: FormData) {
  const memberIdsRaw = String(formData.get("memberIds") ?? "[]");
  let memberIds: string[] = [];
  try {
    const parsed = JSON.parse(memberIdsRaw) as unknown;
    if (Array.isArray(parsed)) {
      memberIds = parsed.map((id) => String(id));
    }
  } catch {
    memberIds = [];
  }

  return {
    name: String(formData.get("name") ?? "").trim(),
    chairmanId: String(formData.get("chairmanId") ?? "").trim(),
    viceChairmanId: String(formData.get("viceChairmanId") ?? "").trim(),
    memberIds,
  };
}

async function loadSbMembers(token: string): Promise<SBMember[]> {
  const rows = await apiGetAuth<Array<SBMemberRow & { imageUrl?: string }>>(
    "/api/admin/sb-members",
    token
  );
  return rows.map((row) =>
    mapSBMemberRowToMember(row, row.imageUrl ?? "")
  );
}

function mapCommittees(
  rows: CommitteeRow[],
  members: SBMember[]
): Committee[] {
  const memberById = new Map(members.map((member) => [member.id, member]));
  return rows.map((row) => mapCommitteeRowToCommittee(row, memberById));
}

export async function fetchCommitteesPageDataAction(): Promise<
  ActionResult<CommitteesPageData>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const [committeeRows, sbMembers] = await Promise.all([
      apiGetAuth<CommitteeRow[]>("/api/admin/committees", token),
      loadSbMembers(token),
    ]);

    return {
      success: true,
      data: {
        committees: mapCommittees(committeeRows, sbMembers),
        sbMembers,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load committees.",
    };
  }
}

export async function fetchCommitteeDetailAction(
  id: string
): Promise<ActionResult<CommitteeDetail>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<CommitteeRow[]>(
      "/api/admin/committees",
      token
    );
    const row = rows.find((entry) => entry.id === id);
    if (!row) {
      return { success: false, error: "Committee not found." };
    }

    return {
      success: true,
      data: {
        name: row.name,
        chairmanId: row.chairman_id ?? "",
        viceChairmanId: row.vice_chairman_id ?? "",
        memberIds: Array.isArray(row.member_ids) ? row.member_ids : [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load committee.",
    };
  }
}

export async function createCommitteeAction(
  formData: FormData
): Promise<ActionResult<Committee>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<CommitteeRow>(
      "/api/admin/committees",
      token,
      formDataToCommitteeBody(formData)
    );
    const sbMembers = await loadSbMembers(token);
    revalidatePath("/admin/committees");
    revalidatePath("/sbchart");
    return {
      success: true,
      data: mapCommittees([row], sbMembers)[0]!,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create committee.",
    };
  }
}

export async function updateCommitteeAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Committee>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPatchAuth<CommitteeRow>(
      `/api/admin/committees/${id}`,
      token,
      formDataToCommitteeBody(formData)
    );
    const sbMembers = await loadSbMembers(token);
    revalidatePath("/admin/committees");
    revalidatePath("/sbchart");
    return {
      success: true,
      data: mapCommittees([row], sbMembers)[0]!,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update committee.",
    };
  }
}

export async function deleteCommitteeAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth(`/api/admin/committees/${id}`, token);
    revalidatePath("/admin/committees");
    revalidatePath("/sbchart");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete committee.",
    };
  }
}
