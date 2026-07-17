"use server";

import { revalidatePath } from "next/cache";
import { apiGetAuth, apiFormAuth, apiDeleteAuth, apiPostAuth, ApiError } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import { mapOrdinanceRowToDocument, type OrdinanceRow } from "@/lib/mappers/ordinance-mapper";
import type { LegislativeDocument } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchOrdinancesAction(): Promise<
  ActionResult<LegislativeDocument[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<(OrdinanceRow & { pdfUrl?: string })[]>(
      "/api/admin/ordinances",
      token
    );
    return {
      success: true,
      data: rows.map((row) =>
        mapOrdinanceRowToDocument(row, row.pdfUrl ?? "")
      ),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load ordinances.",
    };
  }
}

export async function fetchOrdinanceByIdAction(
  id: string
): Promise<ActionResult<LegislativeDocument>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiGetAuth<OrdinanceRow & { pdfUrl?: string }>(
      `/api/admin/ordinances/${id}`,
      token
    );
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

export async function createOrdinanceAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await apiFormAuth<{ id: string }>(
      "/api/admin/ordinances",
      token,
      formData,
      "POST"
    );
    revalidatePath("/admin/ordinances");
    revalidatePath("/ordinances");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create ordinance.",
    };
  }
}

export async function updateOrdinanceAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await apiFormAuth<{ id: string }>(
      `/api/admin/ordinances/${id}`,
      token,
      formData,
      "PATCH"
    );
    revalidatePath("/admin/ordinances");
    revalidatePath(`/admin/ordinances/${id}`);
    revalidatePath("/ordinances");
    revalidatePath(`/ordinances/${id}`);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update ordinance.",
    };
  }
}

export async function deleteOrdinanceAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth("/api/admin/ordinances/" + id, token);
    revalidatePath("/admin/ordinances");
    revalidatePath("/ordinances");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete ordinance.",
    };
  }
}

export async function toggleOrdinancePublishAction(
  id: string
): Promise<ActionResult<LegislativeDocument>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<OrdinanceRow & { pdfUrl?: string }>(
      `/api/admin/ordinances/${id}/publish`,
      token
    );
    revalidatePath("/admin/ordinances");
    revalidatePath(`/admin/ordinances/${id}`);
    revalidatePath("/ordinances");
    revalidatePath(`/ordinances/${id}`);
    return {
      success: true,
      data: mapOrdinanceRowToDocument(row, row.pdfUrl ?? ""),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle publish status.",
    };
  }
}
