type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const ADMIN_CACHE_KEYS = {
  dashboard: "admin:dashboard",
  ordinances: "admin:ordinances",
  resolutions: "admin:resolutions",
  minutes: "admin:minutes",
  categories: "admin:categories:active",
  categoriesAll: "admin:categories:all",
  users: "admin:users",
  committees: "admin:committees",
  sbMembers: "admin:sb-members",
  cso: "admin:cso",
  activity: "admin:activity",
  profile: "admin:profile",
  documentRequests: "admin:document-requests",
} as const;

export const DEFAULT_ADMIN_STALE_TIME = 60_000;

export function getCachedAdminData<T>(
  key: string,
  staleTime = DEFAULT_ADMIN_STALE_TIME
): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > staleTime) return null;
  return entry.data as T;
}

export function getCachedAdminDataAny<T>(key: string): T | null {
  const entry = cache.get(key);
  return entry ? (entry.data as T) : null;
}

export function setCachedAdminData<T>(key: string, data: T) {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateAdminCache(key?: string) {
  if (key) {
    cache.delete(key);
    return;
  }
  cache.clear();
}

/** Clear list + dashboard caches so create/edit appear immediately after navigation. */
export function invalidateAdminDocumentCaches(
  listKey:
    | typeof ADMIN_CACHE_KEYS.ordinances
    | typeof ADMIN_CACHE_KEYS.resolutions
    | typeof ADMIN_CACHE_KEYS.minutes
) {
  invalidateAdminCache(listKey);
  invalidateAdminCache(ADMIN_CACHE_KEYS.dashboard);
  invalidateAdminCache(ADMIN_CACHE_KEYS.activity);
}

export function patchCachedAdminData<T>(
  key: string,
  updater: (current: T) => T
) {
  const entry = cache.get(key);
  if (!entry) return;
  cache.set(key, {
    data: updater(entry.data as T),
    timestamp: Date.now(),
  });
}
