export interface SbMemberRow {
  id: string;
  lgu_id: string;
  name: string;
  position_slot: number;
  position: string;
  image_storage_path: string | null;
  committees: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const SB_MEMBER_SELECT =
  "id, lgu_id, name, position_slot, position, image_storage_path, committees, created_by, created_at, updated_at";

export const SB_MEMBER_PHOTO_BUCKET = "sb-member-photos";
