import type { ScanAdjustments } from "./types";
import {
  boxBlur,
  buildLuminance,
  clamp255,
  downsampleLuminance,
  percentile,
  sharpenLuminance,
  upsampleMap,
} from "./cv-utils";

/**
 * Sauvola adaptive threshold — standard document binarization used in scan apps.
 * Handles uneven lighting by comparing each pixel to a local mean/std threshold.
 */
function sauvolaBinarize(
  gray: Float32Array,
  width: number,
  height: number,
  radius: number,
  k: number,
  r: number,
  thresholdOffset: number,
  edgeSoftness: number
): Float32Array {
  const pixelCount = gray.length;
  const mean = boxBlur(gray, width, height, radius);

  const squared = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    squared[p] = gray[p] * gray[p];
  }
  const meanSq = boxBlur(squared, width, height, radius);

  const out = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    const variance = Math.max(0, meanSq[p] - mean[p] * mean[p]);
    const std = Math.sqrt(variance);
    const threshold =
      mean[p] * (1 + k * (std / r - 1)) - thresholdOffset;
    const diff = gray[p] - threshold;

    if (edgeSoftness <= 0.5) {
      out[p] = diff >= 0 ? 255 : 0;
    } else {
      out[p] = clamp255(255 / (1 + Math.exp(-diff / edgeSoftness)));
    }
  }

  return out;
}

/**
 * CamScanner-style B&W pipeline:
 * 1. Illumination normalization (shadow removal)
 * 2. Global percentile stretch for even tonal range
 * 3. Noise reduction + optional sharpening
 * 4. Sauvola adaptive binarization (clean black text, white paper)
 * 5. User contrast / brightness / details adjustments
 */
export function applyCamScannerBw(
  imageData: ImageData,
  adjustments: ScanAdjustments
): void {
  const { width, height, data } = imageData;
  const pixelCount = width * height;

  const luminance = buildLuminance(data, pixelCount);

  const blurRadius = Math.max(10, Math.round(Math.min(width, height) / 16));
  const downsampled = downsampleLuminance(luminance, width, height, 1024);
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
    const illum = Math.max(illumination[p], 10);
    reflectance[p] = (luminance[p] / illum) * 132;
  }

  const low = percentile(reflectance, 0.02);
  const high = percentile(reflectance, 0.98);
  const range = Math.max(high - low, 1);

  let gray = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    gray[p] = clamp255(((reflectance[p] - low) / range) * 255);
  }

  const denoised = boxBlur(gray, width, height, 1);

  const userDetails = Math.max(0, adjustments.details / 100);
  const prepared =
    userDetails > 0
      ? sharpenLuminance(denoised, width, height, userDetails * 1.2, 1)
      : denoised;

  const windowRadius = Math.max(
    7,
    Math.min(22, Math.round(Math.min(width, height) / 32))
  );
  const k = 0.38 - adjustments.contrast / 350;
  const safeK = Math.max(0.18, Math.min(0.55, k));
  const thresholdOffset = adjustments.brightness * 0.4;
  const edgeSoftness = Math.max(0.5, 5 - userDetails * 3);

  const binary = sauvolaBinarize(
    prepared,
    width,
    height,
    windowRadius,
    safeK,
    128,
    thresholdOffset,
    edgeSoftness
  );

  for (let p = 0, i = 0; p < pixelCount; p++, i += 4) {
    const value = clamp255(binary[p]);
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}
