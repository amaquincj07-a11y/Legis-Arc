"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_ADMIN_STALE_TIME,
  getCachedAdminData,
  getCachedAdminDataAny,
  setCachedAdminData,
} from "@/lib/admin-query-cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function useAdminQuery<T>(
  cacheKey: string,
  fetcher: () => Promise<ActionResult<T>>,
  options?: { staleTime?: number; enabled?: boolean }
) {
  const staleTime = options?.staleTime ?? DEFAULT_ADMIN_STALE_TIME;
  const enabled = options?.enabled ?? true;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const initialCached = enabled
    ? getCachedAdminDataAny<T>(cacheKey)
    : null;
  const initialFresh = enabled
    ? getCachedAdminData<T>(cacheKey, staleTime)
    : null;

  const [data, setDataState] = useState<T | null>(initialCached);
  const [loading, setLoading] = useState(enabled && !initialFresh);
  const [error, setError] = useState<string | null>(null);

  const setData = useCallback(
    (value: T | null | ((previous: T) => T | null)) => {
      setDataState((previous) => {
        const base = (previous ?? ([] as unknown as T)) as T;
        const next =
          typeof value === "function"
            ? (value as (previous: T) => T | null)(base)
            : value;
        if (next !== null) {
          setCachedAdminData(cacheKey, next);
        }
        return next;
      });
    },
    [cacheKey]
  );

  const reload = useCallback(
    async (force = false) => {
      if (!enabled) {
        return { success: false as const, error: "Query disabled." };
      }

      if (!force) {
        const fresh = getCachedAdminData<T>(cacheKey, staleTime);
        if (fresh) {
          setData(fresh);
          setLoading(false);
          setError(null);
          return { success: true as const, data: fresh };
        }
      }

      const hasStaleData = Boolean(getCachedAdminDataAny<T>(cacheKey));
      if (!hasStaleData) {
        setLoading(true);
      }

      const result = await fetcherRef.current();
      if (result.success) {
        setCachedAdminData(cacheKey, result.data);
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
      return result;
    },
    [cacheKey, enabled, staleTime]
  );

  useEffect(() => {
    if (!enabled) return;
    void reload();
  }, [cacheKey, enabled, reload]);

  return {
    data,
    loading,
    error,
    reload: () => reload(true),
    setData,
  };
}
