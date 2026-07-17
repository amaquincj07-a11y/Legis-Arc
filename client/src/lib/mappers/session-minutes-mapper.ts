import type { DocumentStatus, SessionMinutes, SessionType } from "@/lib/types";
import { toCalendarDateString } from "@/lib/session-date";

export const SESSION_MINUTES_SELECT =
  "id, lgu_id, session_date, session_type, pdf_storage_path, status, is_public, created_by, created_at, updated_at";

export type SessionMinutesRow = {
  id: string;
  lgu_id: string;
  /** YYYY-MM-DD or ISO string from API / pg */
  session_date: string | Date;
  session_type: SessionType;
  pdf_storage_path: string;
  status: DocumentStatus;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const MINUTES_PDF_BUCKET = "minutes-pdfs";

export function buildMinutesPdfPath(lguId: string, minutesId: string): string {
  return `${lguId}/${minutesId}.pdf`;
}

export function mapSessionMinutesRowToDocument(
  row: SessionMinutesRow,
  pdfUrl: string
): SessionMinutes {
  const createdAt = new Date(row.created_at);

  return {
    id: row.id,
    documentType: "minutes",
    sessionDate: toCalendarDateString(row.session_date),
    sessionType: row.session_type,
    status: row.status,
    isPublic: row.is_public,
    pdfUrl,
    createdBy: row.created_by ?? "",
    createdAt,
    updatedAt: new Date(row.updated_at),
  };
}
