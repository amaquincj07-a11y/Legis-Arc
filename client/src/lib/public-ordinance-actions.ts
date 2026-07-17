"use server";

import { apiGetPublic, publicPlacePath } from "@/lib/api/client";
import {
  mapCategoryRowToCategory,
  type CategoryRow,
} from "@/lib/mappers/category-mapper";
import {
  mapOrdinanceRowToDocument,
  type OrdinanceRow,
} from "@/lib/mappers/ordinance-mapper";
import type { Category, LegislativeDocument } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchPublicOrdinancesAction(
  province: string,
  municipality: string
): Promise<ActionResult<LegislativeDocument[]>> {
  try {
    const path = publicPlacePath(province, municipality, "/ordinances");
    const rows = await apiGetPublic<(OrdinanceRow & { pdfUrl?: string })[]>(path);
    return {
      success: true,
      data: rows.map((row) =>
        mapOrdinanceRowToDocument(row, row.pdfUrl ?? "")
      ),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load ordinances.",
    };
  }
}

export async function fetchPublicOrdinanceByIdAction(
  province: string,
  municipality: string,
  id: string
): Promise<ActionResult<LegislativeDocument>> {
  try {
    const path = publicPlacePath(province, municipality, `/ordinances/${id}`);
    const row = await apiGetPublic<OrdinanceRow & { pdfUrl?: string }>(path);
    return {
      success: true,
      data: mapOrdinanceRowToDocument(row, row.pdfUrl ?? ""),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ordinance not found.",
    };
  }
}

export async function fetchPublicOrdinanceCategoriesAction(
  province: string,
  municipality: string
): Promise<ActionResult<Category[]>> {
  try {
    const path = publicPlacePath(province, municipality, "/categories");
    const rows = await apiGetPublic<CategoryRow[]>(path);
    return {
      success: true,
      data: rows.map(mapCategoryRowToCategory),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load categories.",
    };
  }
}
