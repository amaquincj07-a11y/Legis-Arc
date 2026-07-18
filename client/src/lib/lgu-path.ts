import type { Metadata } from "next";
import {
  DEFAULT_MUNICIPALITY,
  DEFAULT_PROVINCE,
  formatPlaceName,
  getMunicipalities,
  getProvinces,
  isValidPlace,
} from "@/lib/places";

/** Cookie used so middleware can redirect legacy public URLs to LGU paths. */
export const PUBLIC_PLACE_COOKIE = "legisarc_public_place";

/** First path segments reserved by the app (must not be treated as province slugs). */
export const RESERVED_PUBLIC_SEGMENTS = new Set([
  "home",
  "portal",
  "ordinances",
  "resolutions",
  "minutes",
  "sbchart",
  "cso",
  "search",
  "about",
  "contacts",
  "news",
  "admin",
  "login",
  "super-admin",
  "api",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export type LguPathParts = {
  province: string;
  municipality: string;
  /** Path after /{province}/{municipality}, e.g. "/ordinances" or "/ordinances/abc" or "" */
  rest: string;
};

export function placeToSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const provinceBySlug = new Map<string, string>();
const municipalityByProvinceSlug = new Map<string, Map<string, string>>();

function ensureSlugIndexes() {
  if (provinceBySlug.size > 0) return;
  for (const province of getProvinces()) {
    provinceBySlug.set(placeToSlug(province), province);
    const muniMap = new Map<string, string>();
    for (const municipality of getMunicipalities(province)) {
      muniMap.set(placeToSlug(municipality), municipality);
    }
    municipalityByProvinceSlug.set(province, muniMap);
  }
}

export function resolveProvinceSlug(slug: string): string | null {
  ensureSlugIndexes();
  const normalized = placeToSlug(decodeURIComponent(slug));
  if (RESERVED_PUBLIC_SEGMENTS.has(normalized)) return null;
  return provinceBySlug.get(normalized) ?? null;
}

export function resolveMunicipalitySlug(
  province: string,
  slug: string
): string | null {
  ensureSlugIndexes();
  const normalized = placeToSlug(decodeURIComponent(slug));
  return municipalityByProvinceSlug.get(province)?.get(normalized) ?? null;
}

export function resolvePlaceFromSlugs(
  provinceSlug: string,
  municipalitySlug: string
): { province: string; municipality: string } | null {
  const province = resolveProvinceSlug(provinceSlug);
  if (!province) return null;
  const municipality = resolveMunicipalitySlug(province, municipalitySlug);
  if (!municipality || !isValidPlace(province, municipality)) return null;
  return { province, municipality };
}

export function buildLguPath(
  province: string,
  municipality: string,
  rest = ""
): string {
  const base = `/${placeToSlug(province)}/${placeToSlug(municipality)}`;
  if (!rest || rest === "/") return base;
  const suffix = rest.startsWith("/") ? rest : `/${rest}`;
  return `${base}${suffix}`;
}

/**
 * Parse /{provinceSlug}/{municipalitySlug}/... public LGU URLs.
 * Returns null for reserved first segments or unknown places.
 */
export function parseLguPath(pathname: string): LguPathParts | null {
  const clean =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const segments = clean.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const [provinceSlug, municipalitySlug, ...restSegments] = segments;
  if (!provinceSlug || !municipalitySlug) return null;
  if (RESERVED_PUBLIC_SEGMENTS.has(placeToSlug(provinceSlug))) return null;

  const resolved = resolvePlaceFromSlugs(provinceSlug, municipalitySlug);
  if (!resolved) return null;

  const rest =
    restSegments.length > 0 ? `/${restSegments.join("/")}` : "";
  return { ...resolved, rest };
}

export function encodePlaceCookie(
  province: string,
  municipality: string
): string {
  return `${province}|${municipality}`;
}

export function decodePlaceCookie(
  value: string | undefined | null
): { province: string; municipality: string } | null {
  if (!value) return null;
  const [province, municipality] = value.split("|");
  if (!province || !municipality) return null;
  if (!isValidPlace(province, municipality)) return null;
  return { province, municipality };
}

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function buildLguMetadata(options: {
  province: string;
  municipality: string;
  pathRest?: string;
  pageTitle?: string;
  pageDescription?: string;
}): Metadata {
  const municipalityName = formatPlaceName(options.municipality);
  const provinceName = formatPlaceName(options.province);
  const path = buildLguPath(
    options.province,
    options.municipality,
    options.pathRest ?? ""
  );
  const title =
    options.pageTitle ??
    `Sangguniang Bayan ng ${municipalityName} - Legislative Records`;
  const description =
    options.pageDescription ??
    `This Legislative Archive Platform provides public access to ordinances, resolutions, session minutes, and information about the Sangguniang Bayan of ${municipalityName}, ${provinceName}.`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${getSiteUrl()}${path}`,
    },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}${path}`,
      siteName: "LegisArc",
      type: "website",
      locale: "en_PH",
    },
  };
}

export function defaultPlace(): { province: string; municipality: string } {
  return { province: DEFAULT_PROVINCE, municipality: DEFAULT_MUNICIPALITY };
}

/** Public sections that get LGU-prefixed SEO URLs. */
export const LGU_PUBLIC_SECTIONS = [
  "",
  "/ordinances",
  "/resolutions",
  "/minutes",
  "/sbchart",
  "/cso",
] as const;
