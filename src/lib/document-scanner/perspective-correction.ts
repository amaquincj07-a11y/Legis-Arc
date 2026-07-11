type Point = { x: number; y: number };

const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function orderCorners(points: Point[]): [Point, Point, Point, Point] {
  const sorted = [...points].sort((a, b) => a.y - b.y);
  const top = sorted.slice(0, 2).sort((a, b) => a.x - b.x);
  const bottom = sorted.slice(2, 4).sort((a, b) => a.x - b.x);
  return [top[0], top[1], bottom[1], bottom[0]];
}

function boxBlurGray(
  src: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  const dst = new Float32Array(src.length);
  const temp = new Float32Array(src.length);
  const windowSize = radius * 2 + 1;

  const clampIndex = (value: number, max: number) =>
    value < 0 ? 0 : value > max ? max : value;

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

function dilate(binary: Uint8Array, width: number, height: number, radius: number) {
  const out = new Uint8Array(binary.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 0;
      for (let dy = -radius; dy <= radius && !on; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sx = clamp(x + dx, 0, width - 1);
          const sy = clamp(y + dy, 0, height - 1);
          if (binary[sy * width + sx]) {
            on = 1;
            break;
          }
        }
      }
      out[y * width + x] = on;
    }
  }
  binary.set(out);
}

function toGrayscale(data: Uint8ClampedArray, pixelCount: number): Float32Array {
  const gray = new Float32Array(pixelCount);
  for (let i = 0, p = 0; p < pixelCount; p++, i += 4) {
    gray[p] = data[i] * LUMA_R + data[i + 1] * LUMA_G + data[i + 2] * LUMA_B;
  }
  return gray;
}

function sobelEdges(gray: Float32Array, width: number, height: number): Float32Array {
  const out = new Float32Array(gray.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const tl = gray[idx - width - 1];
      const tc = gray[idx - width];
      const tr = gray[idx - width + 1];
      const ml = gray[idx - 1];
      const mr = gray[idx + 1];
      const bl = gray[idx + width - 1];
      const bc = gray[idx + width];
      const br = gray[idx + width + 1];

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      out[idx] = Math.hypot(gx, gy);
    }
  }
  return out;
}

function thresholdEdges(edges: Float32Array, percentileValue: number): Uint8Array {
  const sorted = Array.from(edges).sort((a, b) => a - b);
  const threshold = sorted[Math.floor(sorted.length * percentileValue)] ?? 0;
  const binary = new Uint8Array(edges.length);
  for (let i = 0; i < edges.length; i++) {
    binary[i] = edges[i] >= threshold ? 1 : 0;
  }
  return binary;
}

function findLargestContour(
  binary: Uint8Array,
  width: number,
  height: number,
  minArea: number
): Point[] | null {
  const visited = new Uint8Array(binary.length);
  let best: Point[] | null = null;
  let bestArea = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      if (!binary[start] || visited[start]) continue;

      const stack = [start];
      const contour: Point[] = [];
      visited[start] = 1;

      while (stack.length > 0) {
        const current = stack.pop()!;
        const cx = current % width;
        const cy = Math.floor(current / width);
        contour.push({ x: cx, y: cy });

        const neighbors = [
          current - 1,
          current + 1,
          current - width,
          current + width,
        ];

        for (const next of neighbors) {
          const nx = next % width;
          const ny = Math.floor(next / width);
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (!binary[next] || visited[next]) continue;
          visited[next] = 1;
          stack.push(next);
        }
      }

      if (contour.length >= minArea && contour.length > bestArea) {
        bestArea = contour.length;
        best = contour;
      }
    }
  }

  return best;
}

function convexHull(points: Point[]): Point[] {
  if (points.length <= 3) return points;

  const sorted = [...points].sort((a, b) =>
    a.x === b.x ? a.y - b.y : a.x - b.x
  );

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const point = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  if (dx === 0 && dy === 0) return distance(point, lineStart);
  const t =
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
  const proj = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };
  return distance(point, proj);
}

function douglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > maxDistance) {
      maxDistance = d;
      index = i;
    }
  }

  if (maxDistance > epsilon) {
    const left = douglasPeucker(points.slice(0, index + 1), epsilon);
    const right = douglasPeucker(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }

  return [points[0], points[end]];
}

function quadFromHull(hull: Point[]): Point[] | null {
  if (hull.length < 4) return null;

  for (let pass = 0; pass < 8; pass++) {
    const perimeter = hull.reduce(
      (sum, point, index) =>
        sum + distance(point, hull[(index + 1) % hull.length]),
      0
    );
    const epsilon = (perimeter * (0.01 + pass * 0.008)) / hull.length;
    const simplified = douglasPeucker(hull, epsilon);
    if (simplified.length === 4) return simplified;
    if (simplified.length < 4 && pass === 7) break;
  }

  let tl = hull[0];
  let tr = hull[0];
  let br = hull[0];
  let bl = hull[0];

  for (const point of hull) {
    const sum = point.x + point.y;
    const diff = point.x - point.y;
    if (sum < tl.x + tl.y) tl = point;
    if (sum > br.x + br.y) br = point;
    if (diff > tr.x - tr.y) tr = point;
    if (diff < bl.x - bl.y) bl = point;
  }

  return [tl, tr, br, bl];
}

function isValidQuad(corners: Point[], width: number, height: number): boolean {
  const ordered = orderCorners(corners);
  const area = Math.abs(
    (ordered[0].x * ordered[1].y -
      ordered[1].x * ordered[0].y +
      ordered[1].x * ordered[2].y -
      ordered[2].x * ordered[1].y +
      ordered[2].x * ordered[3].y -
      ordered[3].x * ordered[2].y +
      ordered[3].x * ordered[0].y -
      ordered[0].x * ordered[3].y) /
      2
  );

  const imageArea = width * height;
  if (area < imageArea * 0.12 || area > imageArea * 0.98) return false;

  const minEdge = Math.min(
    distance(ordered[0], ordered[1]),
    distance(ordered[1], ordered[2]),
    distance(ordered[2], ordered[3]),
    distance(ordered[3], ordered[0])
  );
  if (minEdge < Math.min(width, height) * 0.18) return false;

  return true;
}

function detectDocumentCorners(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Point[] | null {
  const pixelCount = width * height;
  let gray = toGrayscale(data, pixelCount);
  gray = boxBlurGray(gray, width, height, 2);
  const edges = sobelEdges(gray, width, height);
  const binary = thresholdEdges(edges, 0.86);
  dilate(binary, width, height, 2);

  const contour = findLargestContour(
    binary,
    width,
    height,
    Math.round(pixelCount * 0.01)
  );
  if (!contour || contour.length < 40) return null;

  const step = Math.max(1, Math.floor(contour.length / 500));
  const sampled = contour.filter((_, index) => index % step === 0);
  const hull = convexHull(sampled);
  const quad = quadFromHull(hull);
  if (!quad || !isValidQuad(quad, width, height)) return null;

  return orderCorners(quad);
}

function computeHomography(src: Point[], dst: Point[]): number[] {
  const matrix: number[][] = [];
  const vector: number[] = [];

  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    matrix.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    vector.push(u);
    matrix.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    vector.push(v);
  }

  const h = solveLinearSystem8x8(matrix, vector);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function solveLinearSystem8x8(matrix: number[][], vector: number[]): number[] {
  const size = 8;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);

  for (let col = 0; col < size; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < size; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivotRow][col])) {
        pivotRow = row;
      }
    }
    [augmented[col], augmented[pivotRow]] = [augmented[pivotRow], augmented[col]];

    const pivot = augmented[col][col];
    if (Math.abs(pivot) < 1e-8) continue;

    for (let j = col; j <= size; j++) {
      augmented[col][j] /= pivot;
    }

    for (let row = 0; row < size; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let j = col; j <= size; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  return augmented.map((row) => row[size]);
}

function invertHomography(h: number[]): number[] | null {
  const [a, b, c, d, e, f, g, hVal, i] = h;
  const det =
    a * (e * i - f * hVal) -
    b * (d * i - f * g) +
    c * (d * hVal - e * g);

  if (Math.abs(det) < 1e-10) return null;

  const invDet = 1 / det;
  return [
    (e * i - f * hVal) * invDet,
    (c * hVal - b * i) * invDet,
    (b * f - c * e) * invDet,
    (f * g - d * i) * invDet,
    (a * i - c * g) * invDet,
    (c * d - a * f) * invDet,
    (d * hVal - e * g) * invDet,
    (b * g - a * hVal) * invDet,
    (a * e - b * d) * invDet,
  ];
}

function sampleBilinear(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): [number, number, number] {
  const sx = clamp(x, 0, width - 1);
  const sy = clamp(y, 0, height - 1);
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const fx = sx - x0;
  const fy = sy - y0;

  const idx = (py: number, px: number) => (py * width + px) * 4;

  const i00 = idx(y0, x0);
  const i10 = idx(y0, x1);
  const i01 = idx(y1, x0);
  const i11 = idx(y1, x1);

  const r =
    data[i00] * (1 - fx) * (1 - fy) +
    data[i10] * fx * (1 - fy) +
    data[i01] * (1 - fx) * fy +
    data[i11] * fx * fy;
  const g =
    data[i00 + 1] * (1 - fx) * (1 - fy) +
    data[i10 + 1] * fx * (1 - fy) +
    data[i01 + 1] * (1 - fx) * fy +
    data[i11 + 1] * fx * fy;
  const b =
    data[i00 + 2] * (1 - fx) * (1 - fy) +
    data[i10 + 2] * fx * (1 - fy) +
    data[i01 + 2] * (1 - fx) * fy +
    data[i11 + 2] * fx * fy;

  return [r, g, b];
}

function warpPerspective(
  source: ImageData,
  srcCorners: Point[],
  outWidth: number,
  outHeight: number
): ImageData {
  const dstCorners: Point[] = [
    { x: 0, y: 0 },
    { x: outWidth - 1, y: 0 },
    { x: outWidth - 1, y: outHeight - 1 },
    { x: 0, y: outHeight - 1 },
  ];

  const forward = computeHomography(srcCorners, dstCorners);
  const inverse = invertHomography(forward);
  if (!inverse) return source;

  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = inverse;
  const output = new ImageData(outWidth, outHeight);

  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const denom = h6 * x + h7 * y + h8;
      if (Math.abs(denom) < 1e-8) continue;
      const srcX = (h0 * x + h1 * y + h2) / denom;
      const srcY = (h3 * x + h4 * y + h5) / denom;

      if (srcX < 0 || srcY < 0 || srcX >= source.width || srcY >= source.height) {
        continue;
      }

      const [r, g, b] = sampleBilinear(
        source.data,
        source.width,
        source.height,
        srcX,
        srcY
      );
      const outIndex = (y * outWidth + x) * 4;
      output.data[outIndex] = r;
      output.data[outIndex + 1] = g;
      output.data[outIndex + 2] = b;
      output.data[outIndex + 3] = 255;
    }
  }

  return output;
}

function computeOutputSize(corners: Point[]): { width: number; height: number } {
  const [tl, tr, br, bl] = orderCorners(corners);
  const width = Math.max(distance(tl, tr), distance(bl, br));
  const height = Math.max(distance(tl, bl), distance(tr, br));
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

function detectOnImageData(imageData: ImageData): Point[] | null {
  const longest = Math.max(imageData.width, imageData.height);
  const maxSide = 900;
  if (longest <= maxSide) {
    return detectDocumentCorners(imageData.data, imageData.width, imageData.height);
  }

  const scale = maxSide / longest;
  const sw = Math.max(1, Math.round(imageData.width * scale));
  const sh = Math.max(1, Math.round(imageData.height * scale));
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = sw;
  smallCanvas.height = sh;
  const ctx = smallCanvas.getContext("2d");
  if (!ctx) return null;

  const temp = document.createElement("canvas");
  temp.width = imageData.width;
  temp.height = imageData.height;
  temp.getContext("2d")?.putImageData(imageData, 0, 0);
  ctx.drawImage(temp, 0, 0, sw, sh);
  const small = ctx.getImageData(0, 0, sw, sh);
  const corners = detectDocumentCorners(small.data, sw, sh);
  if (!corners) return null;

  const inv = 1 / scale;
  return corners.map((point) => ({ x: point.x * inv, y: point.y * inv }));
}

/**
 * Detects document edges and applies perspective rectification (CamScanner-style).
 * Returns the original image if no reliable quadrilateral is found.
 */
export async function correctDocumentPerspective(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const corners = detectOnImageData(source);
  if (!corners) return dataUrl;

  const { width, height } = computeOutputSize(corners);
  const warped = warpPerspective(source, corners, width, height);

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  output.getContext("2d")?.putImageData(warped, 0, 0);
  return output.toDataURL("image/jpeg", 0.92);
}
