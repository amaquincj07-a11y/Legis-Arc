import type { DistrictAssignment, SBMember } from "@/lib/types";
import { formatSBMemberDisplayName } from "@/lib/utils";

export type DistrictAssignmentRow = {
  id: string;
  lgu_id: string;
  barangay_name: string;
  sb_member_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** Display label matching public SB chart (e.g. Brgy. Bil-isan). */
export function formatBarangayLabel(barangayName: string): string {
  const titled = barangayName
    .toLowerCase()
    .split(/([\s-]+)/)
    .map((part) => {
      if (!part || /^[\s-]+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
  return `Brgy. ${titled}`;
}

export function mapDistrictAssignmentRow(
  row: DistrictAssignmentRow,
  memberById: Map<string, SBMember>
): DistrictAssignment {
  const member = memberById.get(row.sb_member_id);
  return {
    id: row.id,
    barangayName: row.barangay_name,
    sbMemberId: row.sb_member_id,
    sbMemberName: member
      ? formatSBMemberDisplayName(member)
      : "Unassigned",
  };
}
