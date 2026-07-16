import type { Category } from "@/lib/types";

export const CATEGORY_SELECT =
  "id, lgu_id, name, is_active, sort_order, created_by, created_at, updated_at";

export type CategoryRow = {
  id: string;
  lgu_id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function mapCategoryRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
  };
}
