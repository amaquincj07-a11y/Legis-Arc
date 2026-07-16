import { formatSBMemberDisplayName } from "@/lib/utils";
import type { Committee, SBMember } from "@/lib/types";

export const COMMITTEE_SELECT =
  "id, lgu_id, name, chairman_id, vice_chairman_id, member_ids, created_by, created_at, updated_at";

export type CommitteeRow = {
  id: string;
  lgu_id: string;
  name: string;
  chairman_id: string;
  vice_chairman_id: string;
  member_ids: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function mapCommitteeRowToCommittee(
  row: CommitteeRow,
  memberById: Map<string, SBMember>
): Committee {
  const chairman = memberById.get(row.chairman_id);
  const viceChairman = memberById.get(row.vice_chairman_id);

  return {
    id: row.id,
    name: row.name,
    yearTerm: "",
    chairman: chairman ? formatSBMemberDisplayName(chairman) : "—",
    viceChairman: viceChairman ? formatSBMemberDisplayName(viceChairman) : "—",
    members: (row.member_ids ?? [])
      .map((memberId) => memberById.get(memberId))
      .filter((member): member is SBMember => Boolean(member))
      .map((member) => formatSBMemberDisplayName(member)),
  };
}
