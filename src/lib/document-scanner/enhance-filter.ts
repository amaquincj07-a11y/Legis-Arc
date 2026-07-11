import type { ScanAdjustments } from "./types";
import {
  applyClahe,
  applyLuminanceToRgb,
  boxBlur,
  buildLuminance,
  clamp255,
  downsampleLuminance,
  percentile,
  sharpenLuminance,
  sigmoidContrast,
  upsampleMap,
} from "./cv-utils";

/**
 * CamScanner-style Enhance pipeline:
 * 1. Illumination normalization (moderate Retinex)
 * 2. CLAHE for local contrast and crisp text
 * 3. S-curve global contrast for text/background separation
 * 4. Multi-scale unsharp masking
 * 5. Paper background whitening
 * 6. User contrast / brightness / details adjustments
 */
export function applyCamScannerEnhance(
  imageData: ImageData,
  adjustments: ScanAdjustments
): void {
  const { width, height, data } = imageData;
  const pixelCount = width * height;

  const luminance = buildLuminance(data, pixelCount);

  const blurRadius = Math.max(6, Math.round(Math.min(width, height) / 22));
  const downsampled = downsampleLuminance(luminance, width, height, 1024);
  const smallBlur = boxBlur(
    downsampled.data,
    downsampled.width,
    downsampled.height,
    Math.max(3, Math.round(blurRadius * downsampled.scale))
  );

  const illumination =
    downsampled.scale === 1
      ? smallBlur
      : upsampleMap(
          smallBlur,
          downsampled.width,
          downsampled.height,
          width,
          height
        );

  const normalized = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    const illum = Math.max(illumination[p], 14);
    normalized[p] = clamp255((luminance[p] / illum) * 140);
  }

  const tileSize = Math.max(
    32,
    Math.min(72, Math.round(Math.min(width, height) / 14))
  );
  const clipLimit = 2.4 + adjustments.contrast / 80;
  let enhanced = applyClahe(normalized, width, height, tileSize, clipLimit);

  const contrastStrength = 2.2 + adjustments.contrast / 45;
  for (let p = 0; p < pixelCount; p++) {
    enhanced[p] = sigmoidContrast(enhanced[p], contrastStrength);
  }

  const brightnessOffset = adjustments.brightness * 0.45;
  if (brightnessOffset !== 0) {
    for (let p = 0; p < pixelCount; p++) {
      enhanced[p] = clamp255(enhanced[p] + brightnessOffset);
    }
  }

  for (let p = 0; p < pixelCount; p++) {
    if (enhanced[p] > 195) {
      enhanced[p] = clamp255(enhanced[p] + (255 - enhanced[p]) * 0.42);
    } else if (enhanced[p] < 95) {
      enhanced[p] = clamp255(enhanced[p] * 0.88);
    }
  }

  const baseDetails = 0.75;
  const userDetails = Math.max(0, adjustments.details / 100) * 1.8;
  let sharpened = sharpenLuminance(
    enhanced,
    width,
    height,
    baseDetails + userDetails,
    1
  );
  sharpened = sharpenLuminance(sharpened, width, height, 0.35 + userDetails * 0.25, 2);

  applyLuminanceToRgb(data, luminance, sharpened, pixelCount);
}
