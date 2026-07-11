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
  upsampleMap,
} from "./cv-utils";

function fuseMultiScaleIllumination(
  luminance: Float32Array,
  width: number,
  height: number
): Float32Array {
  const pixelCount = luminance.length;
  const base = Math.min(width, height);
  const radii = [
    Math.max(6, Math.round(base / 24)),
    Math.max(14, Math.round(base / 14)),
    Math.max(24, Math.round(base / 8)),
  ];

  const downsampled = downsampleLuminance(luminance, width, height, 1024);
  const fused = new Float32Array(pixelCount);

  for (const radius of radii) {
    const scaledRadius = Math.max(3, Math.round(radius * downsampled.scale));
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
 * 1. Multi-scale illumination (MSR-style shadow map)
 * 2. Retinex reflectance + CLAHE for even lighting with crisp text
 * 3. Shadow lift + paper brightening
 * 4. Sharpening driven by Details slider
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
    reflectance[p] = (luminance[p] / illum) * 140;
  }

  const low = percentile(reflectance, 0.02);
  const high = percentile(reflectance, 0.98);
  const range = Math.max(high - low, 1);

  const normalized = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    normalized[p] = clamp255(((reflectance[p] - low) / range) * 255);
  }

  const tileSize = Math.max(
    28,
    Math.min(60, Math.round(Math.min(width, height) / 17))
  );
  let outputLum = applyClahe(
    normalized,
    width,
    height,
    tileSize,
    2.2 + adjustments.contrast / 90
  );

  const contrastScale = 1 + adjustments.contrast / 110;
  const brightnessOffset = adjustments.brightness * 0.55;
  const gamma = 0.88 - adjustments.brightness / 580;
  const safeGamma = Math.max(0.74, Math.min(1.02, gamma));

  for (let p = 0; p < pixelCount; p++) {
    let value = outputLum[p];
    value = 255 * Math.pow(Math.max(0, value) / 255, safeGamma);
    value = (value - 128) * contrastScale + 128 + brightnessOffset;

    if (value < 118) {
      value += (118 - value) * 0.35;
    } else if (value > 202) {
      value += (255 - value) * 0.28;
    }

    outputLum[p] = clamp255(value);
  }

  const detailsNorm = Math.max(0, adjustments.details / 100);
  const sharpened = sharpenLuminance(
    outputLum,
    width,
    height,
    0.9 + detailsNorm * 1.8,
    1
  );

  applyLuminanceToRgb(data, luminance, sharpened, pixelCount);
}
