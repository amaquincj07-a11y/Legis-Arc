/**
 * Shared API base URL for the Express backend.
 * Loaded from root `.env` via next.config.ts `loadEnvConfig`.
 *
 * On the Droplet, Server Actions run inside the `web` container. Prefer
 * `INTERNAL_API_URL` (e.g. http://api:4000) so multipart uploads stay on the
 * Docker network instead of hairpinning through public nginx (which hangs).
 * Browsers still use `NEXT_PUBLIC_API_URL` via client-side fetch.
 */
export function getApiBaseUrl(): string {
  const isServer = typeof window === "undefined";
  const raw = isServer
    ? process.env.INTERNAL_API_URL?.trim() ||
      process.env.NEXT_PUBLIC_API_URL?.trim() ||
      "http://localhost:4000"
    : process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  return raw.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}
