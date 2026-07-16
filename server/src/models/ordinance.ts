import type { DocumentStatus, OrdinanceKind } from "./enums.js";

export interface OrdinanceRow {
  id: string;
  lgu_id: string;
  ordinance_number: string;
  series_year: number;
  title: string;
  author_sponsor: string;
  category: string;
  ordinance_kind: OrdinanceKind;
  pdf_storage_path: string | null;
  status: DocumentStatus;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const ORDINANCE_SELECT =
  "id, lgu_id, ordinance_number, series_year, title, author_sponsor, category, ordinance_kind, pdf_storage_path, status, is_public, created_by, created_at, updated_at";

export const ORDINANCE_PDF_BUCKET = "ordinance-pdfs";

export function buildOrdinancePdfPath(
  lguId: string,
  ordinanceId: string
): string {
  return `${lguId}/${ordinanceId}.pdf`;
}
