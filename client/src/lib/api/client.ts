import { apiUrl } from "./config";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: string; details?: unknown };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

function readBrowserToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split("=").slice(1).join("=");
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Call the Express `/api/*` backend.
 * Expects `{ success, data }` / `{ success: false, error }` envelopes.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers, signal } = options;
  const accessToken = options.accessToken ?? readBrowserToken();

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Cannot reach LegisArc API. Is the server running on NEXT_PUBLIC_API_URL?",
      0
    );
  }

  let payload: ApiResult<T> | null = null;
  try {
    payload = (await response.json()) as ApiResult<T>;
  } catch {
    throw new ApiError(
      `API returned a non-JSON response (${response.status})`,
      response.status
    );
  }

  if (!response.ok || !payload?.success) {
    const message =
      payload && "error" in payload && payload.error
        ? payload.error
        : `API request failed (${response.status})`;
    throw new ApiError(
      message,
      response.status,
      payload && "details" in payload ? payload.details : undefined
    );
  }

  return payload.data;
}

export function apiGetPublic<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(path, { signal });
}

export function apiGetAuth<T>(
  path: string,
  accessToken: string,
  signal?: AbortSignal
): Promise<T> {
  return apiRequest<T>(path, { accessToken, signal });
}

export function apiPostAuth<T>(
  path: string,
  accessToken: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(path, { method: "POST", accessToken, body });
}

export function apiPatchAuth<T>(
  path: string,
  accessToken: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(path, { method: "PATCH", accessToken, body });
}

export function apiDeleteAuth<T>(
  path: string,
  accessToken: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE", accessToken, body });
}

export function apiPostPublic<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body, accessToken: null });
}

/**
 * Multipart upload (do not set Content-Type — fetch sets boundary).
 */
export async function apiFormAuth<T>(
  path: string,
  accessToken: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST"
): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  // Uploads can be slow on Spaces; fail clearly instead of endless Save spinner.
  const timeoutMs = 120_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        "Upload timed out. Check API connectivity and Spaces credentials.",
        0
      );
    }
    throw new ApiError(
      "Cannot reach LegisArc API. Is the server running on NEXT_PUBLIC_API_URL?",
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let payload: ApiResult<T> | null = null;
  try {
    payload = (await response.json()) as ApiResult<T>;
  } catch {
    throw new ApiError(
      `API returned a non-JSON response (${response.status})`,
      response.status
    );
  }

  if (!response.ok || !payload?.success) {
    const message =
      payload && "error" in payload && payload.error
        ? payload.error
        : `API request failed (${response.status})`;
    throw new ApiError(
      message,
      response.status,
      payload && "details" in payload ? payload.details : undefined
    );
  }

  return payload.data;
}

export function encodePlaceSegment(value: string): string {
  return encodeURIComponent(value.trim().toUpperCase());
}

export function publicPlacePath(
  province: string,
  municipality: string,
  suffix: string
): string {
  const p = encodePlaceSegment(province);
  const m = encodePlaceSegment(municipality);
  const s = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `/api/public/${p}/${m}${s}`;
}
