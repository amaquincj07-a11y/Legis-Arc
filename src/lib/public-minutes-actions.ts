"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { toPlaceStorageKey } from "@/lib/supabase/lgu-mapper";
import {
  mapSessionMinutesRowToDocument,
  MINUTES_PDF_BUCKET,
  SESSION_MINUTES_SELECT,
  type SessionMinutesRow,
} from "@/lib/supabase/session-minutes-mapper";
import type { SessionMinutes } from "@/lib/types";

export type PublicActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const SIGNED_URL_TTL_SECONDS = 3600;

async function resolveLguId(
  province: string,
  municipality: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lgus")
    .select("id")
    .eq("province", toPlaceStorageKey(province))
    .eq("municipality", toPlaceStorageKey(municipality))
    .maybeSingle();

  if (error || !data) return null;
  return data.id as string;
}

async function createSignedPdfUrl(storagePath: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(MINUTES_PDF_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
}

export async function fetchPublicSessionMinutesAction(
  province: string,
  municipality: string
): Promise<PublicActionResult<SessionMinutes[]>> {
  try {
    const lguId = await resolveLguId(province, municipality);
    if (!lguId) {
      return { success: true, data: [] };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("session_minutes")
      .select(SESSION_MINUTES_SELECT)
      .eq("lgu_id", lguId)
      .eq("is_public", true)
      .eq("status", "published")
      .order("session_date", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const documents = ((data ?? []) as SessionMinutesRow[]).map((row) =>
      mapSessionMinutesRowToDocument(row, "")
    );

    return { success: true, data: documents };
  } catch {
    return { success: false, error: "Failed to load session minutes." };
  }
}

export async function fetchPublicSessionMinutesByIdAction(
  id: string,
  province: string,
  municipality: string
): Promise<PublicActionResult<SessionMinutes>> {
  try {
    const lguId = await resolveLguId(province, municipality);
    if (!lguId) {
      return { success: false, error: "Session minutes not found." };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("session_minutes")
      .select(SESSION_MINUTES_SELECT)
      .eq("id", id)
      .eq("lgu_id", lguId)
      .eq("is_public", true)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: "Session minutes not found." };
    }

    const row = data as SessionMinutesRow;
    const pdfUrl = await createSignedPdfUrl(row.pdf_storage_path);

    return {
      success: true,
      data: mapSessionMinutesRowToDocument(row, pdfUrl),
    };
  } catch {
    return { success: false, error: "Failed to load session minutes." };
  }
}
