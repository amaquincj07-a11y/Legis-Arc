export type ScanFilterPreset =
  | "original"
  | "lightning"
  | "enhance"
  | "no-shadow"
  | "bw";

export type ScanAdjustments = {
  contrast: number;
  brightness: number;
  details: number;
};

export type ScanCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
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
