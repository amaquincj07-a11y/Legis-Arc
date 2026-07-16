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
 * CamScanner-style Lighten pipeline:
 * 1. Retinex illumination normalization
 * 2. Percentile stretch + CLAHE for local text contrast
 * 3. Gamma whitening + sigmoid text/background separation
 * 4. Multi-scale sharpening driven by Details slider
 */
export function applyCamScannerLighten(
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

  const low = percentile(reflectance, 0.025);
  const high = percentile(reflectance, 0.975);
  const range = Math.max(high - low, 1);

  const normalized = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    normalized[p] = clamp255(((reflectance[p] - low) / range) * 255);
  }

  const tileSize = Math.max(
    28,
    Math.min(64, Math.round(Math.min(width, height) / 18))
  );
  const claheStrength = 1.8 + Math.max(0, adjustments.contrast) / 120;
  let enhanced = applyClahe(normalized, width, height, tileSize, claheStrength);

  const contrastScale = 1 + adjustments.contrast / 100;
  const brightnessOffset = adjustments.brightness * 0.65;
  const gamma = 0.82 - adjustments.brightness / 520;
  const safeGamma = Math.max(0.68, Math.min(1.02, gamma));
  const sigmoidStrength = 1.4 + Math.max(0, adjustments.contrast) / 55;

  const outputLum = new Float32Array(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    let value = enhanced[p];
    value = 255 * Math.pow(Math.max(0, value) / 255, safeGamma);
    value = (value - 128) * contrastScale + 128 + brightnessOffset;
    value = sigmoidContrast(value, sigmoidStrength);

    if (value > 208) {
      value += (255 - value) * 0.48;
    } else if (value < 105) {
      value = clamp255(value * 0.92);
    }

    outputLum[p] = clamp255(value);
  }

  const detailsNorm = Math.max(0, adjustments.details / 100);
  let sharpened = sharpenLuminance(
    outputLum,
    width,
    height,
    1.1 + detailsNorm * 2.4,
    1
  );
  sharpened = sharpenLuminance(
    sharpened,
    width,
    height,
    0.45 + detailsNorm * 0.85,
    2
  );

  applyLuminanceToRgb(data, luminance, sharpened, pixelCount);
}
