"use server";

import { requireLGUSession } from "@/lib/supabase/require-lgu-user";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type DashboardCategoryCount = {
  name: string;
  count: number;
};

export type DashboardStats = {
  ordinanceCount: number;
  resolutionCount: number;
  minutesCount: number;
  totalDocuments: number;
  categoryBreakdown: DashboardCategoryCount[];
};

function toActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function fetchDashboardStatsAction(): Promise<
  ActionResult<DashboardStats>
> {
  try {
    const { session, error } = await requireLGUSession();
    if (error || !session) return { success: false, error: error! };

    const { supabase, lguId } = session;

    const [
      ordinancesCountResult,
      resolutionsCountResult,
      minutesCountResult,
      categoriesResult,
    ] = await Promise.all([
      supabase
        .from("ordinances")
        .select("*", { count: "exact", head: true })
        .eq("lgu_id", lguId),
      supabase
        .from("resolutions")
        .select("*", { count: "exact", head: true })
        .eq("lgu_id", lguId),
      supabase
        .from("session_minutes")
        .select("*", { count: "exact", head: true })
        .eq("lgu_id", lguId),
      supabase
        .from("document_categories")
        .select("name")
        .eq("lgu_id", lguId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (ordinancesCountResult.error) {
      return { success: false, error: ordinancesCountResult.error.message };
    }
    if (resolutionsCountResult.error) {
      return { success: false, error: resolutionsCountResult.error.message };
    }
    if (minutesCountResult.error) {
      return { success: false, error: minutesCountResult.error.message };
    }
    if (categoriesResult.error) {
      return { success: false, error: categoriesResult.error.message };
    }

    const ordinanceCount = ordinancesCountResult.count ?? 0;
    const resolutionCount = resolutionsCountResult.count ?? 0;
    const minutesCount = minutesCountResult.count ?? 0;

    const categoryNames = (categoriesResult.data ?? []).map(
      (row) => row.name as string
    );

    let categoryBreakdown: DashboardCategoryCount[] = [];

    if (categoryNames.length > 0) {
      const countResults = await Promise.all(
        categoryNames.map((name) =>
          supabase
            .from("ordinances")
            .select("*", { count: "exact", head: true })
            .eq("lgu_id", lguId)
            .eq("category", name)
        )
      );

      categoryBreakdown = categoryNames
        .map((name, index) => ({
          name,
          count: countResults[index].count ?? 0,
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }

    return {
      success: true,
      data: {
        ordinanceCount,
        resolutionCount,
        minutesCount,
        totalDocuments: ordinanceCount + resolutionCount + minutesCount,
        categoryBreakdown,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: toActionError(error, "Unable to load dashboard data."),
    };
  }
}
