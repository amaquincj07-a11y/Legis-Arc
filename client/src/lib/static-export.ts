/** Placeholder used only when no real IDs are available at build time. */
export const STATIC_EXPORT_PLACEHOLDER_ID = "static-export-placeholder";

/**
 * `output: "export"` requires generateStaticParams to return at least one entry.
 * An empty array is reported as a missing generateStaticParams error.
 */
export function ensureStaticParams<T extends { id: string }>(params: T[]): T[] {
  return params.length > 0
    ? params
    : [{ id: STATIC_EXPORT_PLACEHOLDER_ID } as T];
}
