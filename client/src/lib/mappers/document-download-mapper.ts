import type { DocumentDownloadRecord, DocumentType } from "@/lib/types";

export const DOCUMENT_DOWNLOAD_SELECT =
  "id, lgu_id, document_id, document_type, document_number, document_title, document_category, requester_name, office_org, purpose, consent_agreed, created_at";

export type DocumentDownloadRow = {
  id: string;
  lgu_id: string;
  document_id: string;
  document_type: DocumentType;
  document_number: string | null;
  document_title: string;
  document_category: string | null;
  requester_name: string | null;
  office_org: string;
  purpose: string;
  consent_agreed: boolean;
  created_at: string;
};

function formatFileType(documentType: DocumentType): string {
  if (documentType === "ordinance") return "Ordinance";
  if (documentType === "resolution") return "Resolution";
  return "Minutes";
}

export function mapDocumentDownloadRowToRecord(
  row: DocumentDownloadRow
): DocumentDownloadRecord {
  return {
    id: row.id,
    dateRequested: new Date(row.created_at),
    name: row.requester_name?.trim() || "—",
    office: row.office_org,
    purpose: row.purpose,
    fileType: formatFileType(row.document_type),
    documentNumber: row.document_number?.trim() || "—",
    title: row.document_title,
    category: row.document_category?.trim() || "—",
  };
}
