export interface CsoRow {
  id: string;
  lgu_id: string;
  name: string;
  officer_name: string;
  position: string;
  term: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const CSO_SELECT =
  "id, lgu_id, name, officer_name, position, term, created_by, created_at, updated_at";
