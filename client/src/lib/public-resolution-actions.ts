"use server";

import { apiGetPublic, publicPlacePath } from "@/lib/api/client";
import { mapResolutionRowToDocument, type ResolutionRow } from "@/lib/mappers/resolution-mapper";
import type { LegislativeDocument } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchPublicResolutionsAction(
  province: string,
  municipality: string
): Promise<ActionResult<LegislativeDocument[]>> {
  try {
    const path = publicPlacePath(province, municipality, "/resolutions");
    const rows = await apiGetPublic<ResolutionRow[]>(path);
    return {
      success: true,
      data: rows.map((row) => mapResolutionRowToDocument(row, "")),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load resolutions.",
    };
  }
}

export async function fetchPublicResolutionByIdAction(
  province: string,
  municipality: string,
  id: string
): Promise<ActionResult<LegislativeDocument>> {
  try {
    const path = publicPlacePath(province, municipality, `/resolutions/${id}`);
    const row = await apiGetPublic<ResolutionRow & { pdfUrl?: string }>(path);
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
