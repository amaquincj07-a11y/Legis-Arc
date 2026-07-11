import type { ScanAdjustments } from "./types";
import {
  applyLuminanceToRgb,
  boxBlur,
  buildLuminance,
  clamp255,
  downsampleLuminance,
  percentile,
  sharpenLuminance,
  upsampleMap,
} from "./cv-utils";

/**
 * CamScanner-style Lighten pipeline:
 * 1. Estimate large-scale illumination (shadow map)
 * 2. Divide luminance by illumination (Retinex-style reflectance)
 * 3. Percentile stretch + gamma to whiten paper background
 * 4. Preserve color by scaling RGB channels proportionally
 * 5. Apply user contrast / brightness / details adjustments
 */
export function applyCamScannerLighten(
  imageData: ImageData,
  adjustments: ScanAdjustments
): void {
  const { width, height, data } = imageData;
  const pixelCount = width * height;

  const luminance = buildLuminance(data, pixelCount);

  const blurRadius = Math.max(
    8,
    Math.round(Math.min(width, height) / 18)
  );

  const downsampled = downsampleLuminance(luminance, width, height, 960);
  const smallBlur = boxBlur(
    downsampled.data,
    downsampled.width,
    downsampled.height,
    Math.max(4, Math.round(blurRadius * downsampled.scale))
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

  const reflectance = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    const illum = Math.max(illumination[p], 12);
    reflectance[p] = (luminance[p] / illum) * 128;
  }

  const low = percentile(reflectance, 0.04);
  const high = percentile(reflectance, 0.96);
  const range = Math.max(high - low, 1);

  const contrastScale = 1 + adjustments.contrast / 120;
  const brightnessOffset = adjustments.brightness * 0.55;
  const gamma = 0.86 - adjustments.brightness / 600;
  const safeGamma = Math.max(0.72, Math.min(1.05, gamma));

  const outputLum = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    let normalized = ((reflectance[p] - low) / range) * 255;
    normalized = 255 * Math.pow(Math.max(0, normalized) / 255, safeGamma);
    normalized = (normalized - 128) * contrastScale + 128 + brightnessOffset;

    if (normalized > 210) {
      normalized += (255 - normalized) * 0.35;
    }

    outputLum[p] = clamp255(normalized);
  }

  const detailsAmount = Math.max(0, adjustments.details / 100) * 1.4;
  const sharpenedLum = sharpenLuminance(outputLum, width, height, detailsAmount);

  applyLuminanceToRgb(data, luminance, sharpenedLum, pixelCount);
}
