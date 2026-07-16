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

/** Maps UI slider 0–100 (50 = neutral) to internal -100..100. */
export function displayToInternal(display: number): number {
  return (display - 50) * 2;
}

/**
 * Tuned default slider values per filter (CamScanner-style clarity targets).
 * Display scale: Contrast 20 / Brightness 100 / Details 100 for Lighten;
 * B&W uses high details + moderate contrast for crisp PDF-like text.
 */
export const FILTER_DEFAULT_ADJUSTMENTS: Record<
  ScanFilterPreset,
  ScanAdjustments
> = {
  original: { ...DEFAULT_ADJUSTMENTS },
  lightning: {
    contrast: displayToInternal(20),
    brightness: displayToInternal(100),
    details: displayToInternal(100),
  },
  enhance: {
    contrast: displayToInternal(65),
    brightness: displayToInternal(58),
    details: displayToInternal(92),
  },
  "no-shadow": {
    contrast: displayToInternal(45),
    brightness: displayToInternal(62),
    details: displayToInternal(85),
  },
  bw: {
    contrast: displayToInternal(68),
    brightness: displayToInternal(54),
    details: displayToInternal(100),
  },
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
    filter: "bw",
    adjustments: { ...FILTER_DEFAULT_ADJUSTMENTS.bw },
    rotation: 0,
    crop: null,
  };
}
