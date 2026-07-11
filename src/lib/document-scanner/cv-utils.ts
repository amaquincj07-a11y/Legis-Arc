export const LUMA_R = 0.299;
export const LUMA_G = 0.587;
export const LUMA_B = 0.114;

export function clamp255(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

export function clampIndex(value: number, max: number): number {
  return value < 0 ? 0 : value > max ? max : value;
}

/** Separable box blur — fast illumination estimation and smoothing. */
export function boxBlur(
  src: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  const dst = new Float32Array(src.length);
  const temp = new Float32Array(src.length);
  const windowSize = radius * 2 + 1;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    let sum = 0;
    for (let x = -radius; x <= radius; x++) {
      sum += src[row + clampIndex(x, width - 1)];
    }
    temp[row] = sum / windowSize;
    for (let x = 1; x < width; x++) {
      sum +=
        src[row + clampIndex(x + radius, width - 1)] -
        src[row + clampIndex(x - radius - 1, width - 1)];
      temp[row + x] = sum / windowSize;
    }
  }

  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      sum += temp[clampIndex(y, height - 1) * width + x];
    }
    dst[x] = sum / windowSize;
    for (let y = 1; y < height; y++) {
      sum +=
        temp[clampIndex(y + radius, height - 1) * width + x] -
        temp[clampIndex(y - radius - 1, height - 1) * width + x];
      dst[y * width + x] = sum / windowSize;
    }
  }

  return dst;
}

export function buildLuminance(
  data: Uint8ClampedArray,
  pixelCount: number
): Float32Array {
  const lum = new Float32Array(pixelCount);
  for (let i = 0, p = 0; p < pixelCount; p++, i += 4) {
    lum[p] = data[i] * LUMA_R + data[i + 1] * LUMA_G + data[i + 2] * LUMA_B;
  }
  return lum;
}

export function downsampleLuminance(
  lum: Float32Array,
  width: number,
  height: number,
  maxSide: number
): { data: Float32Array; width: number; height: number; scale: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) {
    return { data: lum, width, height, scale: 1 };
  }

  const scale = maxSide / longest;
  const sw = Math.max(1, Math.round(width * scale));
  const sh = Math.max(1, Math.round(height * scale));
  const small = new Float32Array(sw * sh);

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const sx = Math.min(width - 1, Math.round(x / scale));
      const sy = Math.min(height - 1, Math.round(y / scale));
      small[y * sw + x] = lum[sy * width + sx];
    }
  }

  return { data: small, width: sw, height: sh, scale };
}

export function upsampleMap(
  small: Float32Array,
  sw: number,
  sh: number,
  width: number,
  height: number
): Float32Array {
  const full = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const sy = (y / height) * (sh - 1);
    const y0 = Math.floor(sy);
    const y1 = Math.min(sh - 1, y0 + 1);
    const fy = sy - y0;

    for (let x = 0; x < width; x++) {
      const sx = (x / width) * (sw - 1);
      const x0 = Math.floor(sx);
      const x1 = Math.min(sw - 1, x0 + 1);
      const fx = sx - x0;

      const v00 = small[y0 * sw + x0];
      const v10 = small[y0 * sw + x1];
      const v01 = small[y1 * sw + x0];
      const v11 = small[y1 * sw + x1];

      full[y * width + x] =
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy;
    }
  }
  return full;
}

export function percentile(values: Float32Array, p: number): number {
  const bins = 512;
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const range = max - min || 1;
  const hist = new Uint32Array(bins);
  for (let i = 0; i < values.length; i++) {
    const bin = Math.min(
      bins - 1,
      Math.floor(((values[i] - min) / range) * (bins - 1))
    );
    hist[bin]++;
  }

  const target = values.length * p;
  let cumulative = 0;
  for (let i = 0; i < bins; i++) {
    cumulative += hist[i];
    if (cumulative >= target) {
      return min + (i / (bins - 1)) * range;
    }
  }

  return max;
}

export function sharpenLuminance(
  lum: Float32Array,
  width: number,
  height: number,
  amount: number,
  radius = 1
): Float32Array {
  if (amount <= 0) return lum;

  const blurred = boxBlur(lum, width, height, radius);
  const out = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) {
    out[i] = clamp255(lum[i] + (lum[i] - blurred[i]) * amount);
  }
  return out;
}

export function applyLuminanceToRgb(
  data: Uint8ClampedArray,
  originalLum: Float32Array,
  outputLum: Float32Array,
  pixelCount: number
): void {
  for (let p = 0, i = 0; p < pixelCount; p++, i += 4) {
    const oldLum = Math.max(originalLum[p], 1);
    const factor = outputLum[p] / oldLum;

    data[i] = clamp255(data[i] * factor);
    data[i + 1] = clamp255(data[i + 1] * factor);
    data[i + 2] = clamp255(data[i + 2] * factor);
  }
}

/** S-curve sigmoid for stronger text/background separation. */
export function sigmoidContrast(value: number, strength: number): number {
  const x = (value - 128) / 128;
  const k = 1 + strength * 0.06;
  const curved = Math.tanh(x * k) / Math.tanh(k);
  return clamp255(128 + curved * 128);
}

/**
 * CLAHE — Contrast Limited Adaptive Histogram Equalization.
 * CamScanner Enhance uses local histogram equalization for crisp text.
 */
export function applyClahe(
  lum: Float32Array,
  width: number,
  height: number,
  tileSize: number,
  clipLimit: number
): Float32Array {
  const tilesX = Math.max(1, Math.ceil(width / tileSize));
  const tilesY = Math.max(1, Math.ceil(height / tileSize));
  const lookupTables: Float32Array[] = [];

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const x0 = tx * tileSize;
      const y0 = ty * tileSize;
      const x1 = Math.min(width, x0 + tileSize);
      const y1 = Math.min(height, y0 + tileSize);
      const tilePixels = (x1 - x0) * (y1 - y0);

      const hist = new Uint32Array(256);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const bin = clamp255(Math.round(lum[y * width + x]));
          hist[bin]++;
        }
      }

      const clipThreshold = Math.max(1, (clipLimit * tilePixels) / 256);
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > clipThreshold) {
          excess += hist[i] - clipThreshold;
          hist[i] = clipThreshold;
        }
      }
      const redistribute = Math.floor(excess / 256);
      const remainder = excess - redistribute * 256;
      for (let i = 0; i < 256; i++) {
        hist[i] += redistribute;
      }
      for (let i = 0; i < remainder; i++) {
        hist[i % 256]++;
      }

      const lut = new Float32Array(256);
      let cumulative = 0;
      for (let i = 0; i < 256; i++) {
        cumulative += hist[i];
        lut[i] = (cumulative / tilePixels) * 255;
      }
      lookupTables[ty * tilesX + tx] = lut;
    }
  }

  const out = new Float32Array(lum.length);

  for (let y = 0; y < height; y++) {
    const ty = y / tileSize - 0.5;
    const ty0 = clampIndex(Math.floor(ty), tilesY - 1);
    const ty1 = clampIndex(ty0 + 1, tilesY - 1);
    const fy = ty - ty0;

    for (let x = 0; x < width; x++) {
      const tx = x / tileSize - 0.5;
      const tx0 = clampIndex(Math.floor(tx), tilesX - 1);
      const tx1 = clampIndex(tx0 + 1, tilesX - 1);
      const fx = tx - tx0;

      const bin = clamp255(Math.round(lum[y * width + x]));

      const v00 = lookupTables[ty0 * tilesX + tx0][bin];
      const v10 = lookupTables[ty0 * tilesX + tx1][bin];
      const v01 = lookupTables[ty1 * tilesX + tx0][bin];
      const v11 = lookupTables[ty1 * tilesX + tx1][bin];

      out[y * width + x] =
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy;
    }
  }

  return out;
}