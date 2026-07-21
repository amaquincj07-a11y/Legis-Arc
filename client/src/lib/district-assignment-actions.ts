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
  mapDistrictAssignmentRow,
  type DistrictAssignmentRow,
} from "@/lib/mappers/district-assignment-mapper";
import {
  mapSBMemberRowToMember,
  type SBMemberRow,
} from "@/lib/mappers/sb-member-mapper";
import type { DistrictAssignment, SBMember } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type DistrictAssignmentsPageData = {
  assignments: DistrictAssignment[];
  sbMembers: SBMember[];
  barangays: string[];
};

async function loadSbMembers(token: string): Promise<SBMember[]> {
  const rows = await apiGetAuth<Array<SBMemberRow & { imageUrl?: string }>>(
    "/api/admin/sb-members",
    token
  );
  return rows.map((row) =>
    mapSBMemberRowToMember(row, row.imageUrl ?? "")
  );
}

function mapAssignments(
  rows: DistrictAssignmentRow[],
  members: SBMember[]
): DistrictAssignment[] {
  const memberById = new Map(members.map((member) => [member.id, member]));
  return rows.map((row) => mapDistrictAssignmentRow(row, memberById));
}

export async function fetchDistrictAssignmentsPageDataAction(): Promise<
  ActionResult<DistrictAssignmentsPageData>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const [listPayload, sbMembers] = await Promise.all([
      apiGetAuth<{
        assignments: DistrictAssignmentRow[];
        barangays: string[];
      }>("/api/admin/district-assignments", token),
      loadSbMembers(token),
    ]);

    return {
      success: true,
      data: {
        assignments: mapAssignments(listPayload.assignments, sbMembers),
        sbMembers,
        barangays: listPayload.barangays,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load district assignments.",
    };
  }
}

export async function createDistrictAssignmentAction(input: {
  barangayName: string;
  sbMemberId: string;
}): Promise<ActionResult<DistrictAssignment>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<DistrictAssignmentRow>(
      "/api/admin/district-assignments",
      token,
      {
        barangayName: input.barangayName,
        sbMemberId: input.sbMemberId,
      }
    );
    const sbMembers = await loadSbMembers(token);
    revalidatePath("/admin/sb-members");
    revalidatePath("/sbchart");
    return {
      success: true,
      data: mapAssignments([row], sbMembers)[0]!,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create district assignment.",
    };
  }
}

export async function updateDistrictAssignmentAction(
  id: string,
  input: { barangayName: string; sbMemberId: string }
): Promise<ActionResult<DistrictAssignment>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPatchAuth<DistrictAssignmentRow>(
      `/api/admin/district-assignments/${id}`,
      token,
      {
        barangayName: input.barangayName,
        sbMemberId: input.sbMemberId,
      }
    );
    const sbMembers = await loadSbMembers(token);
    revalidatePath("/admin/sb-members");
    revalidatePath("/sbchart");
    return {
      success: true,
      data: mapAssignments([row], sbMembers)[0]!,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update district assignment.",
    };
  }
}

export async function deleteDistrictAssignmentAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth(`/api/admin/district-assignments/${id}`, token);
    revalidatePath("/admin/sb-members");
    revalidatePath("/sbchart");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete district assignment.",
    };
  }
}
