export interface ActivityLogRow {
  id: string;
  lgu_id: string;
  user_id: string;
  user_name: string;
  action: string;
  module: string;
  entity_id: string | null;
  entity_title: string | null;
  details: unknown;
  created_at: string;
}

export interface DownloadLogRow {
  id: string;
  lgu_id: string;
  document_id: string;
  document_type: string;
  document_number: string;
  document_title: string;
  document_category: string;
  requester_name: string;
  office_org: string;
  purpose: string;
  consent_agreed: boolean;
  created_at: string;
}

export const ACTIVITY_LOG_SELECT =
  "id, lgu_id, user_id, user_name, action, module, entity_id, entity_title, details, created_at";

export const DOWNLOAD_LOG_SELECT =
  "id, lgu_id, document_id, document_type, document_number, document_title, document_category, requester_name, office_org, purpose, consent_agreed, created_at";
