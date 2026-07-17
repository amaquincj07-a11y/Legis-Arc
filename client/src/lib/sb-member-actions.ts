"use server";

import { revalidatePath } from "next/cache";
import { apiGetAuth, apiFormAuth, apiDeleteAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  getPositionLabelForSlot,
  mapSBMemberRowToMember,
  type SBMemberRow,
} from "@/lib/mappers/sb-member-mapper";
import type { SBMember, SBMemberPositionSlot } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type SBMemberApiRow = SBMemberRow & { imageUrl?: string };

function mapMember(row: SBMemberApiRow): SBMember {
  return mapSBMemberRowToMember(row, row.imageUrl ?? "");
}

function ensurePositionOnFormData(formData: FormData): FormData {
  const positionSlot = String(
    formData.get("positionSlot") ?? ""
  ) as SBMemberPositionSlot | "";
  if (positionSlot && !String(formData.get("position") ?? "").trim()) {
    formData.set("position", getPositionLabelForSlot(positionSlot));
  }
  return formData;
}

export async function fetchSBMembersAction(): Promise<
  ActionResult<SBMember[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<SBMemberApiRow[]>(
      "/api/admin/sb-members",
      token
    );
    return {
      success: true,
      data: rows.map(mapMember),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load SB members.",
    };
  }
}

export async function createSBMemberAction(
  formData: FormData
): Promise<ActionResult<SBMember>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiFormAuth<SBMemberApiRow>(
      "/api/admin/sb-members",
      token,
      ensurePositionOnFormData(formData),
      "POST"
    );
    revalidatePath("/admin/sb-members");
    revalidatePath("/admin/committees");
    revalidatePath("/sbchart");
    return { success: true, data: mapMember(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create SB member.",
    };
  }
}

export async function updateSBMemberAction(
  id: string,
  formData: FormData
): Promise<ActionResult<SBMember>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiFormAuth<SBMemberApiRow>(
      `/api/admin/sb-members/${id}`,
      token,
      ensurePositionOnFormData(formData),
      "PATCH"
    );
    revalidatePath("/admin/sb-members");
    revalidatePath("/admin/committees");
    revalidatePath("/sbchart");
    return { success: true, data: mapMember(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update SB member.",
    };
  }
}

export async function deleteSBMemberAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth(`/api/admin/sb-members/${id}`, token);
    revalidatePath("/admin/sb-members");
    revalidatePath("/admin/committees");
    revalidatePath("/sbchart");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete SB member.",
    };
  }
}
