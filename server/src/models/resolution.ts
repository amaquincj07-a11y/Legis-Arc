import type { DocumentStatus } from "./enums.js";

export interface ResolutionRow {
  id: string;
  lgu_id: string;
  resolution_number: string;
  series_year: number;
  title: string;
  author_sponsor: string;
  category: string;
  pdf_storage_path: string | null;
  status: DocumentStatus;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const RESOLUTION_SELECT =
  "id, lgu_id, resolution_number, series_year, title, author_sponsor, category, pdf_storage_path, status, is_public, created_by, created_at, updated_at";

export const RESOLUTION_PDF_BUCKET = "resolution-pdfs";
