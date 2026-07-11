import type { ScanAdjustments } from "./types";
import {
  boxBlur,
  buildLuminance,
  clamp255,
  downsampleLuminance,
  medianFilter3x3,
  morphCloseText,
  morphOpenText,
  percentile,
  unsharpMask,
  upsampleMap,
} from "./cv-utils";

/**
 * Sauvola adaptive threshold — document binarization with local mean/std.
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
    const threshold = mean[p] * (1 + k * (std / r - 1)) - thresholdOffset;
    const diff = gray[p] - threshold;

    if (edgeSoftness <= 0.35) {
      out[p] = diff >= 0 ? 255 : 0;
    } else {
      out[p] = clamp255(255 / (1 + Math.exp(-diff / edgeSoftness)));
    }
  }

  return out;
}

/**
 * CamScanner-style B&W pipeline (PDF-like text clarity):
 * 1. Illumination normalization (shadow removal)
 * 2. Tight percentile stretch
 * 3. Median denoise + multi-scale unsharp mask
 * 4. Sauvola adaptive binarization (hard edges at high details)
 * 5. Morphological open/close to remove speckle and fill letter gaps
 */
export function applyCamScannerBw(
  imageData: ImageData,
  adjustments: ScanAdjustments
): void {
  const { width, height, data } = imageData;
  const pixelCount = width * height;

  const luminance = buildLuminance(data, pixelCount);

  const blurRadius = Math.max(12, Math.round(Math.min(width, height) / 14));
  const downsampled = downsampleLuminance(luminance, width, height, 1280);
  const smallBlur = boxBlur(
    downsampled.data,
    downsampled.width,
    downsampled.height,
    Math.max(5, Math.round(blurRadius * downsampled.scale))
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
    reflectance[p] = (luminance[p] / illum) * 138;
  }

  const low = percentile(reflectance, 0.006);
  const high = percentile(reflectance, 0.994);
  const range = Math.max(high - low, 1);

  const gray = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    gray[p] = clamp255(((reflectance[p] - low) / range) * 255);
  }

  const denoised = medianFilter3x3(gray, width, height);

  const detailsNorm = Math.max(0, adjustments.details / 100);
  const sharpFine = 2.4 + detailsNorm * 2.6;
  const sharpCoarse = 0.85 + detailsNorm * 0.95;
  let prepared = unsharpMask(denoised, width, height, sharpFine, 1);
  prepared = unsharpMask(prepared, width, height, sharpCoarse, 2);

  const windowRadius = Math.max(
    9,
    Math.min(28, Math.round(Math.min(width, height) / 28))
  );
  const k = 0.32 - adjustments.contrast / 320;
  const safeK = Math.max(0.16, Math.min(0.48, k));
  const thresholdOffset = adjustments.brightness * 0.55;
  const edgeSoftness = detailsNorm >= 0.75 ? 0 : Math.max(0.35, 4 - detailsNorm * 4.5);

  let binary = sauvolaBinarize(
    prepared,
    width,
    height,
    windowRadius,
    safeK,
    128,
    thresholdOffset,
    edgeSoftness
  );

  if (detailsNorm >= 0.4) {
    binary = morphOpenText(binary, width, height, 1);
    binary = morphCloseText(binary, width, height, 1);
  }

  for (let p = 0, i = 0; p < pixelCount; p++, i += 4) {
    const value = clamp255(binary[p]);
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}
