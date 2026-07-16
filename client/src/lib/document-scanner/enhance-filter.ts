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
 * 1. Illumination normalization
 * 2. CLAHE + sigmoid contrast for crisp text
 * 3. Paper whitening + ink deepening
 * 4. Multi-scale unsharp masking
 */
export function applyCamScannerEnhance(
  imageData: ImageData,
  adjustments: ScanAdjustments
): void {
  const { width, height, data } = imageData;
  const pixelCount = width * height;

  const luminance = buildLuminance(data, pixelCount);

  const blurRadius = Math.max(6, Math.round(Math.min(width, height) / 20));
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
    const illum = Math.max(illumination[p], 12);
    normalized[p] = clamp255((luminance[p] / illum) * 142);
  }

  const stretchLow = percentile(normalized, 0.02);
  const stretchHigh = percentile(normalized, 0.98);
  const stretchRange = Math.max(stretchHigh - stretchLow, 1);
  for (let p = 0; p < pixelCount; p++) {
    normalized[p] = clamp255(((normalized[p] - stretchLow) / stretchRange) * 255);
  }

  const tileSize = Math.max(
    32,
    Math.min(72, Math.round(Math.min(width, height) / 13))
  );
  const clipLimit = 2.8 + adjustments.contrast / 70;
  let enhanced = applyClahe(normalized, width, height, tileSize, clipLimit);

  const contrastStrength = 2.6 + adjustments.contrast / 38;
  for (let p = 0; p < pixelCount; p++) {
    enhanced[p] = sigmoidContrast(enhanced[p], contrastStrength);
  }

  const brightnessOffset = adjustments.brightness * 0.5;
  if (brightnessOffset !== 0) {
    for (let p = 0; p < pixelCount; p++) {
      enhanced[p] = clamp255(enhanced[p] + brightnessOffset);
    }
  }

  for (let p = 0; p < pixelCount; p++) {
    if (enhanced[p] > 198) {
      enhanced[p] = clamp255(enhanced[p] + (255 - enhanced[p]) * 0.5);
    } else if (enhanced[p] < 92) {
      enhanced[p] = clamp255(enhanced[p] * 0.84);
    }
  }

  const detailsNorm = Math.max(0, adjustments.details / 100);
  let sharpened = sharpenLuminance(
    enhanced,
    width,
    height,
    1.2 + detailsNorm * 2.2,
    1
  );
  sharpened = sharpenLuminance(
    sharpened,
    width,
    height,
    0.5 + detailsNorm * 0.55,
    2
  );

  applyLuminanceToRgb(data, luminance, sharpened, pixelCount);
}
