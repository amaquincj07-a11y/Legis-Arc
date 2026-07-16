export interface CommitteeRow {
  id: string;
  lgu_id: string;
  name: string;
  chairman_id: string | null;
  vice_chairman_id: string | null;
  member_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const COMMITTEE_SELECT =
  "id, lgu_id, name, chairman_id, vice_chairman_id, member_ids, created_by, created_at, updated_at";
