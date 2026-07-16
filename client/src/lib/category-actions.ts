"use server";

import { revalidatePath } from "next/cache";
import {
  apiGetAuth,
  apiPostAuth,
  apiPatchAuth,
  apiDeleteAuth,
} from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  mapCategoryRowToCategory,
  type CategoryRow,
} from "@/lib/mappers/category-mapper";
import type { Category } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchCategoriesAction(): Promise<
  ActionResult<Category[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<CategoryRow[]>(
      "/api/admin/categories",
      token
    );
    return {
      success: true,
      data: rows.map(mapCategoryRowToCategory),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load categories.",
    };
  }
}

export async function fetchActiveCategoriesAction(): Promise<
  ActionResult<Category[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<CategoryRow[]>(
      "/api/admin/categories?active=true",
      token
    );
    return {
      success: true,
      data: rows.map(mapCategoryRowToCategory),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load categories.",
    };
  }
}

export async function createCategoryAction(
  name: string
): Promise<ActionResult<Category>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<CategoryRow>(
      "/api/admin/categories",
      token,
      { name }
    );
    revalidatePath("/admin/categories");
    return { success: true, data: mapCategoryRowToCategory(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create category.",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  name: string
): Promise<ActionResult<Category>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPatchAuth<CategoryRow>(
      `/api/admin/categories/${id}`,
      token,
      { name }
    );
    revalidatePath("/admin/categories");
    return { success: true, data: mapCategoryRowToCategory(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update category.",
    };
  }
}

export async function toggleCategoryActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<Category>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPatchAuth<CategoryRow>(
      `/api/admin/categories/${id}`,
      token,
      { isActive }
    );
    revalidatePath("/admin/categories");
    return { success: true, data: mapCategoryRowToCategory(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update category status.",
    };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<null>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await apiDeleteAuth(`/api/admin/categories/${id}`, token);
    revalidatePath("/admin/categories");
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete category.",
    };
  }
}
