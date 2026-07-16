import type { DocumentStatus, SessionType } from "./enums.js";

export interface SessionMinutesRow {
  id: string;
  lgu_id: string;
  session_date: string;
  session_type: SessionType;
  pdf_storage_path: string | null;
  status: DocumentStatus;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const SESSION_MINUTES_SELECT =
  "id, lgu_id, session_date, session_type, pdf_storage_path, status, is_public, created_by, created_at, updated_at";

export const MINUTES_PDF_BUCKET = "minutes-pdfs";
