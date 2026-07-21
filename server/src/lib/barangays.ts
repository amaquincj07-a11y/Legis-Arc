import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type BarangayIndex = Record<string, Record<string, string[]>>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadIndex(): BarangayIndex {
  const candidates = [
    path.resolve(__dirname, "../data/barangays-index.json"),
    path.resolve(__dirname, "../../src/data/barangays-index.json"),
    path.resolve(process.cwd(), "src/data/barangays-index.json"),
    path.resolve(process.cwd(), "dist/data/barangays-index.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, "utf8")) as BarangayIndex;
    }
  }

  console.warn(
    "[barangays] barangays-index.json not found — district barangay lists will be empty"
  );
  return {};
}

const index = loadIndex();

function normalizeKey(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

/** PSA barangay names for a province + municipality. */
export function getBarangaysForPlace(
  province: string,
  municipality: string
): string[] {
  const provinceKey = normalizeKey(province);
  const municipalityKey = normalizeKey(municipality);

  const provinceEntry =
    index[provinceKey] ??
    Object.entries(index).find(
      ([key]) => normalizeKey(key) === provinceKey
    )?.[1];

  if (!provinceEntry) return [];

  const exact = provinceEntry[municipalityKey];
  if (exact) return [...exact];

  const foundKey = Object.keys(provinceEntry).find(
    (key) => normalizeKey(key) === municipalityKey
  );
  return foundKey ? [...(provinceEntry[foundKey] ?? [])] : [];
}
