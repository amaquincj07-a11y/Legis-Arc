export interface CategoryRow {
  id: string;
  lgu_id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_SELECT =
  "id, lgu_id, name, is_active, sort_order, created_by, created_at, updated_at";
