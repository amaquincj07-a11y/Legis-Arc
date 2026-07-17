"use server";

import { revalidatePath } from "next/cache";
import {
  apiGetAuth,
  apiFormAuth,
  apiDeleteAuth,
  apiPostAuth,
} from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  mapSessionMinutesRowToDocument,
  type SessionMinutesRow,
} from "@/lib/mappers/session-minutes-mapper";
import type { SessionMinutes } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchSessionMinutesAction(): Promise<
  ActionResult<SessionMinutes[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<(SessionMinutesRow & { pdfUrl?: string })[]>(
      "/api/admin/minutes",
      token
    );
    return {
      success: true,
      data: rows.map((row) =>
        mapSessionMinutesRowToDocument(row, row.pdfUrl ?? "")
      ),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load minutes.",
    };
  }
}

export async function fetchSessionMinutesByIdAction(
  id: string
): Promise<ActionResult<SessionMinutes>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiGetAuth<SessionMinutesRow & { pdfUrl?: string }>(
      `/api/admin/minutes/${id}`,
      token
    );
    return {
      success: true,
      data: mapSessionMinutesRowToDocument(row, row.pdfUrl ?? ""),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Minutes not found.",
    };
  }
}

export async function createSessionMinutesAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await apiFormAuth<{ id: string }>(
      "/api/admin/minutes",
      token,
      formData,
      "POST"
    );
    revalidatePath("/admin/minutes");
    revalidatePath("/minutes");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create minutes.",
    };
  }
}

export async function updateSessionMinutesAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result = await apiFormAuth<{ id: string }>(
      `/api/admin/minutes/${id}`,
      token,
      formData,
      "PATCH"
    );
    revalidatePath("/admin/minutes");
    revalidatePath(`/admin/minutes/${id}`);
    revalidatePath("/minutes");
    revalidatePath(`/minutes/${id}`);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update minutes.",
    };
  }
}

export async function deleteSessionMinutesAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth(`/api/admin/minutes/${id}`, token);
    revalidatePath("/admin/minutes");
    revalidatePath("/minutes");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete minutes.",
    };
  }
}

export async function toggleSessionMinutesPublishAction(
  id: string
): Promise<ActionResult<SessionMinutes>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<SessionMinutesRow & { pdfUrl?: string }>(
      `/api/admin/minutes/${id}/publish`,
      token
    );
    revalidatePath("/admin/minutes");
    revalidatePath(`/admin/minutes/${id}`);
    revalidatePath("/minutes");
    revalidatePath(`/minutes/${id}`);
    return {
      success: true,
      data: mapSessionMinutesRowToDocument(row, row.pdfUrl ?? ""),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle publish status.",
    };
  }
}
