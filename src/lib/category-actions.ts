"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import {
  CATEGORY_SELECT,
  mapCategoryRowToCategory,
  type CategoryRow,
} from "@/lib/supabase/category-mapper";
import { recordLGUActivity } from "@/lib/activity-log";
import { requireLGUSession } from "@/lib/supabase/require-lgu-user";
import type { Category } from "@/lib/types";

type SupabaseServerClient = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function safeRevalidateCategories() {
  const paths = [
    "/admin/categories",
    "/admin/ordinances",
    "/admin/resolutions",
  ];
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      /* static export */
    }
  }
}

async function fetchCategoryRows(
  supabase: SupabaseServerClient,
  lguId: string,
  activeOnly: boolean
): Promise<CategoryRow[]> {
  let query = supabase
    .from("document_categories")
    .select(CATEGORY_SELECT)
    .eq("lgu_id", lguId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as CategoryRow[];
}

export async function fetchCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const rows = await fetchCategoryRows(
      session.supabase,
      session.lguId,
      false
    );
    return {
      success: true,
      data: rows.map(mapCategoryRowToCategory),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load categories."),
    };
  }
}

export async function fetchActiveCategoriesAction(): Promise<
  ActionResult<Category[]>
> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const rows = await fetchCategoryRows(
      session.supabase,
      session.lguId,
      true
    );
    return {
      success: true,
      data: rows.map(mapCategoryRowToCategory),
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to load categories."),
    };
  }
}

export async function createCategoryAction(
  name: string
): Promise<ActionResult<Category>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Category name is required." };
    }

    const { data: maxSort } = await session.supabase
      .from("document_categories")
      .select("sort_order")
      .eq("lgu_id", session.lguId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sortOrder =
      typeof maxSort?.sort_order === "number" ? maxSort.sort_order + 1 : 0;

    const { data, error: insertError } = await session.supabase
      .from("document_categories")
      .insert({
        id: randomUUID(),
        lgu_id: session.lguId,
        name: trimmed,
        is_active: true,
        sort_order: sortOrder,
        created_by: session.userId,
      })
      .select(CATEGORY_SELECT)
      .single();

    if (insertError || !data) {
      if (insertError?.code === "23505") {
        return {
          success: false,
          error: "A category with this name already exists.",
        };
      }
      return {
        success: false,
        error: insertError?.message ?? "Failed to add category.",
      };
    }

    safeRevalidateCategories();
    const category = mapCategoryRowToCategory(data as CategoryRow);
    await recordLGUActivity({
      session,
      action: "upload",
      module: "categories",
      entityId: category.id,
      entityTitle: trimmed,
      details: `Added category "${trimmed}"`,
    });
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to add category."),
    };
  }
}

export async function updateCategoryAction(
  id: string,
  name: string
): Promise<ActionResult<Category>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, error: "Category name is required." };
    }

    const { data, error: updateError } = await session.supabase
      .from("document_categories")
      .update({ name: trimmed })
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .select(CATEGORY_SELECT)
      .single();

    if (updateError || !data) {
      if (updateError?.code === "23505") {
        return {
          success: false,
          error: "A category with this name already exists.",
        };
      }
      return {
        success: false,
        error: updateError?.message ?? "Failed to update category.",
      };
    }

    safeRevalidateCategories();
    const category = mapCategoryRowToCategory(data as CategoryRow);
    await recordLGUActivity({
      session,
      action: "edit",
      module: "categories",
      entityId: id,
      entityTitle: trimmed,
      details: `Updated category to "${trimmed}"`,
    });
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to update category."),
    };
  }
}

export async function toggleCategoryActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<Category>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { data, error: updateError } = await session.supabase
      .from("document_categories")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .select(CATEGORY_SELECT)
      .single();

    if (updateError || !data) {
      return {
        success: false,
        error: updateError?.message ?? "Failed to update category status.",
      };
    }

    safeRevalidateCategories();
    const category = mapCategoryRowToCategory(data as CategoryRow);
    await recordLGUActivity({
      session,
      action: "edit",
      module: "categories",
      entityId: id,
      entityTitle: category.name,
      details: isActive
        ? `Enabled category "${category.name}"`
        : `Disabled category "${category.name}"`,
    });
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to update category status."),
    };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<null>> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { data: existing, error: fetchError } = await session.supabase
      .from("document_categories")
      .select("name")
      .eq("id", id)
      .eq("lgu_id", session.lguId)
      .maybeSingle();

    if (fetchError || !existing) {
      return { success: false, error: "Category not found." };
    }

    const { error: deleteError } = await session.supabase
      .from("document_categories")
      .delete()
      .eq("id", id)
      .eq("lgu_id", session.lguId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    safeRevalidateCategories();
    await recordLGUActivity({
      session,
      action: "delete",
      module: "categories",
      entityId: id,
      entityTitle: existing.name as string,
      details: `Deleted category "${existing.name}"`,
    });
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Failed to delete category."),
    };
  }
}
