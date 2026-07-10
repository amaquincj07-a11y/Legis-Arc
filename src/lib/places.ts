import placesIndex from "@/lib/places-index.json";

export const DEFAULT_PROVINCE = "BOHOL";
export const DEFAULT_MUNICIPALITY = "PANGLAO";
export const PLACE_FILTER_STORAGE_KEY = "public-place-filter:v1";

const provinceMap = placesIndex.provinces as Record<string, string[]>;

export function getProvinces(): string[] {
  return Object.keys(provinceMap).sort((a, b) =>
    formatPlaceName(a).localeCompare(formatPlaceName(b))
  );
}

export function getMunicipalities(province: string): string[] {
  return provinceMap[province] ?? [];
}

export function isValidPlace(province: string, municipality: string): boolean {
  return getMunicipalities(province).includes(municipality);
}

export function formatPlaceName(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getLguLabel(municipality: string): string {
  const formatted = formatPlaceName(municipality);
  if (/\bcity\b/i.test(municipality)) {
    return `City of ${formatted.replace(/\s*City\s*$/i, "").trim()}`;
  }
  return `Municipality of ${formatted}`;
}

export function getProvinceLabel(province: string): string {
  return `Province of ${formatPlaceName(province)}`;
}

export function getDefaultMunicipalityForProvince(province: string): string {
  const municipalities = getMunicipalities(province);
  if (province === DEFAULT_PROVINCE && municipalities.includes(DEFAULT_MUNICIPALITY)) {
    return DEFAULT_MUNICIPALITY;
  }
  return municipalities[0] ?? "";
}
