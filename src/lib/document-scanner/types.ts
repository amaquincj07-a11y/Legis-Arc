export type ScanFilterPreset =
  | "original"
  | "lightning"
  | "enhance"
  | "no-shadow"
  | "bw";

export type ScanPoint = {
  x: number;
  y: number;
};

export type ScanAdjustments = {
  contrast: number;
  brightness: number;
  details: number;
};

/** Quadrilateral crop — corners ordered tl, tr, br, bl (normalized 0–1). */
export type ScanCrop = {
  corners: [ScanPoint, ScanPoint, ScanPoint, ScanPoint];
};

export type ScanPage = {
  id: string;
  sourceDataUrl: string;
  filter: ScanFilterPreset;
  adjustments: ScanAdjustments;
  rotation: number;
  crop: ScanCrop | null;
};

export type ScannerStep = "camera" | "edit" | "pages";

export const DEFAULT_ADJUSTMENTS: ScanAdjustments = {
  contrast: 0,
  brightness: 0,
  details: 0,
};

export const FILTER_LABELS: Record<ScanFilterPreset, string> = {
  original: "Original",
  lightning: "Lighten",
  enhance: "Enhance",
  "no-shadow": "No shadow",
  bw: "B&W",
};

export function createScanPage(sourceDataUrl: string): ScanPage {
  return {
    id: crypto.randomUUID(),
    sourceDataUrl,
    filter: "original",
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    rotation: 0,
    crop: null,
  };
}
