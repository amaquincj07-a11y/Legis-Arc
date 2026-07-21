export interface DistrictAssignmentRow {
  id: string;
  lgu_id: string;
  barangay_name: string;
  sb_member_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const DISTRICT_ASSIGNMENT_SELECT =
  "id, lgu_id, barangay_name, sb_member_id, created_by, created_at, updated_at";
