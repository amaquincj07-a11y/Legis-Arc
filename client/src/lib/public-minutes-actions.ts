"use server";

import { apiGetPublic, publicPlacePath } from "@/lib/api/client";
import {
  mapSessionMinutesRowToDocument,
  type SessionMinutesRow,
} from "@/lib/mappers/session-minutes-mapper";
import type { SessionMinutes } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchPublicSessionMinutesAction(
  province: string,
  municipality: string
): Promise<ActionResult<SessionMinutes[]>> {
  try {
    const path = publicPlacePath(province, municipality, "/minutes");
    const rows = await apiGetPublic<(SessionMinutesRow & { pdfUrl?: string })[]>(
      path
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

export async function fetchPublicSessionMinutesByIdAction(
  province: string,
  municipality: string,
  id: string
): Promise<ActionResult<SessionMinutes>> {
  try {
    const path = publicPlacePath(province, municipality, `/minutes/${id}`);
    const row = await apiGetPublic<SessionMinutesRow & { pdfUrl?: string }>(
      path
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
