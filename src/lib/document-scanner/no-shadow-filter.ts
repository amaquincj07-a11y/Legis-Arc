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
 * Multi-scale illumination fusion — approximates Multi-Scale Retinex background
 * estimation. Per-pixel max across scales lifts shadow regions while preserving text.
 */
function fuseMultiScaleIllumination(
  luminance: Float32Array,
  width: number,
  height: number
): Float32Array {
  const pixelCount = luminance.length;
  const base = Math.min(width, height);
  const radii = [
    Math.max(6, Math.round(base / 26)),
    Math.max(12, Math.round(base / 15)),
    Math.max(22, Math.round(base / 9)),
  ];

  const downsampled = downsampleLuminance(luminance, width, height, 1024);
  const fused = new Float32Array(pixelCount);

  for (const radius of radii) {
    const scaledRadius = Math.max(
      3,
      Math.round(radius * downsampled.scale)
    );
    const blurred = boxBlur(
      downsampled.data,
      downsampled.width,
      downsampled.height,
      scaledRadius
    );

    const upsampled =
      downsampled.scale === 1
        ? blurred
        : upsampleMap(
            blurred,
            downsampled.width,
            downsampled.height,
            width,
            height
          );

    for (let p = 0; p < pixelCount; p++) {
      if (upsampled[p] > fused[p]) {
        fused[p] = upsampled[p];
      }
    }
  }

  return fused;
}

/**
 * CamScanner-style No Shadow pipeline:
 * 1. Multi-scale illumination estimation (MSR-style shadow map)
 * 2. Retinex reflectance recovery — divide by fused illumination
 * 3. Percentile stretch with gentle gamma for even lighting
 * 4. Shadow lift on dark regions, mild paper brightening
 * 5. Color preserved via proportional RGB scaling
 * 6. User contrast / brightness / details adjustments
 */
export function applyCamScannerNoShadow(
  imageData: ImageData,
  adjustments: ScanAdjustments
): void {
  const { width, height, data } = imageData;
  const pixelCount = width * height;

  const luminance = buildLuminance(data, pixelCount);
  const illumination = fuseMultiScaleIllumination(luminance, width, height);

  const reflectance = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    const illum = Math.max(illumination[p], 8);
    reflectance[p] = (luminance[p] / illum) * 136;
  }

  const low = percentile(reflectance, 0.03);
  const high = percentile(reflectance, 0.97);
  const range = Math.max(high - low, 1);

  const contrastScale = 1 + adjustments.contrast / 130;
  const brightnessOffset = adjustments.brightness * 0.5;
  const gamma = 0.92 - adjustments.brightness / 650;
  const safeGamma = Math.max(0.78, Math.min(1.02, gamma));

  const outputLum = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    let normalized = ((reflectance[p] - low) / range) * 255;
    normalized = 255 * Math.pow(Math.max(0, normalized) / 255, safeGamma);
    normalized = (normalized - 128) * contrastScale + 128 + brightnessOffset;

    if (normalized < 115) {
      normalized += (115 - normalized) * 0.28;
    } else if (normalized > 205) {
      normalized += (255 - normalized) * 0.22;
    }

    outputLum[p] = clamp255(normalized);
  }

  const detailsAmount = Math.max(0, adjustments.details / 100) * 1.1;
  const sharpenedLum = sharpenLuminance(outputLum, width, height, detailsAmount);

  applyLuminanceToRgb(data, luminance, sharpenedLum, pixelCount);
}
