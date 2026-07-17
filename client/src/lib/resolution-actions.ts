"use server";

import { revalidatePath } from "next/cache";
import { apiGetAuth, apiFormAuth, apiDeleteAuth, apiPostAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import { mapResolutionRowToDocument, type ResolutionRow } from "@/lib/mappers/resolution-mapper";
import type { LegislativeDocument } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchResolutionsAction(): Promise<
  ActionResult<LegislativeDocument[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<(ResolutionRow & { pdfUrl?: string })[]>(
      "/api/admin/resolutions",
      token
    );
    return {
      success: true,
      data: rows.map((row) =>
        mapResolutionRowToDocument(row, row.pdfUrl ?? "")
      ),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load resolutions.",
    };
  }
}

export async function fetchResolutionByIdAction(
  id: string
): Promise<ActionResult<LegislativeDocument>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiGetAuth<ResolutionRow & { pdfUrl?: string }>(
      `/api/admin/resolutions/${id}`,
      token
    );
    return {
      success: true,
      data: mapResolutionRowToDocument(row, row.pdfUrl ?? ""),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Resolution not found.",
    };
  }
}

export async function createResolutionAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await apiFormAuth<{ id: string }>(
      "/api/admin/resolutions",
      token,
      formData,
      "POST"
    );
    revalidatePath("/admin/resolutions");
    revalidatePath("/resolutions");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create resolution.",
    };
  }
}

export async function updateResolutionAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await apiFormAuth<{ id: string }>(
      `/api/admin/resolutions/${id}`,
      token,
      formData,
      "PATCH"
    );
    revalidatePath("/admin/resolutions");
    revalidatePath(`/admin/resolutions/${id}`);
    revalidatePath("/resolutions");
    revalidatePath(`/resolutions/${id}`);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update resolution.",
    };
  }
}

export async function deleteResolutionAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth("/api/admin/resolutions/" + id, token);
    revalidatePath("/admin/resolutions");
    revalidatePath("/resolutions");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete resolution.",
    };
  }
}

export async function toggleResolutionPublishAction(
  id: string
): Promise<ActionResult<LegislativeDocument>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<ResolutionRow & { pdfUrl?: string }>(
      `/api/admin/resolutions/${id}/publish`,
      token
    );
    revalidatePath("/admin/resolutions");
    revalidatePath(`/admin/resolutions/${id}`);
    revalidatePath("/resolutions");
    revalidatePath(`/resolutions/${id}`);
    return {
      success: true,
      data: mapResolutionRowToDocument(row, row.pdfUrl ?? ""),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle publish status.",
    };
  }
}
