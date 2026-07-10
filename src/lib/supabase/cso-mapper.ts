import type { CSOOrganization } from "@/lib/types";

export const CSO_SELECT =
  "id, lgu_id, name, officer_name, position, term, created_by, created_at, updated_at";

export type CSORow = {
  id: string;
  lgu_id: string;
  name: string;
  officer_name: string;
  position: string;
  term: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function mapCSORowToOrganization(row: CSORow): CSOOrganization {
  return {
    id: row.id,
    name: row.name,
    officerName: row.officer_name,
    position: row.position,
    term: row.term,
  };
}
