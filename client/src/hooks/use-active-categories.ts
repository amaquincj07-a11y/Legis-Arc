"use client";

import { useCallback } from "react";
import { fetchActiveCategoriesAction } from "@/lib/category-actions";
import {
  ADMIN_CACHE_KEYS,
  invalidateAdminCache,
} from "@/lib/admin-query-cache";
import { useAdminQuery } from "@/hooks/use-admin-query";
import type { Category } from "@/lib/types";

export function useActiveCategories() {
  const { data, loading, reload } = useAdminQuery<Category[]>(
    ADMIN_CACHE_KEYS.categories,
    fetchActiveCategoriesAction,
    { staleTime: 5 * 60_000 }
  );

  const reloadCategories = useCallback(async () => {
    invalidateAdminCache(ADMIN_CACHE_KEYS.categories);
    return reload();
  }, [reload]);

  return {
    categories: data ?? [],
    loading,
    reload: reloadCategories,
  };
}
