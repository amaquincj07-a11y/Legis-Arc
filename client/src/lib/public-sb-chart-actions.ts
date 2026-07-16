"use server";

import { apiGetPublic, publicPlacePath } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
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

export type SBChartData = {
  sbMembers: SBMember[];
  committees: Committee[];
};

function toUploadsUrl(storagePath: string | null | undefined): string {
  if (!storagePath) return "";
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  const cleaned = storagePath.replace(/^\/+/, "");
  return `${getApiBaseUrl()}/uploads/${cleaned}`;
}

export async function fetchPublicSBChartAction(
  province: string,
  municipality: string
): Promise<ActionResult<SBChartData>> {
  try {
    const path = publicPlacePath(province, municipality, "/sb-chart");
    const data = await apiGetPublic<{
      members: Array<SBMemberRow & { imageUrl?: string }>;
      committees: CommitteeRow[];
    }>(path);

    const members = data.members.map((row) =>
      mapSBMemberRowToMember(
        row,
        row.imageUrl ?? toUploadsUrl(row.image_storage_path)
      )
    );
    const memberById = new Map(members.map((member) => [member.id, member]));

    return {
      success: true,
      data: {
        sbMembers: members,
        committees: data.committees.map((row) =>
          mapCommitteeRowToCommittee(row, memberById)
        ),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load SB chart data.",
    };
  }
}
