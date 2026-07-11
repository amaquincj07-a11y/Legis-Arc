import type { ScanCrop, ScanPoint } from "./types";

export type DocumentCorners = [ScanPoint, ScanPoint, ScanPoint, ScanPoint];

const MIN_EDGE = 0.08;

export function getDefaultCrop(): ScanCrop {
  return {
    corners: [
      { x: 0.05, y: 0.05 },
      { x: 0.95, y: 0.05 },
      { x: 0.95, y: 0.95 },
      { x: 0.05, y: 0.95 },
    ],
  };
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function orderCorners(points: ScanPoint[]): DocumentCorners {
  const sorted = [...points].sort((a, b) => a.y - b.y);
  const top = sorted.slice(0, 2).sort((a, b) => a.x - b.x);
  const bottom = sorted.slice(2, 4).sort((a, b) => a.x - b.x);
  return [top[0], top[1], bottom[1], bottom[0]];
}

export function clampQuad(corners: DocumentCorners): DocumentCorners {
  return corners.map((point) => ({
    x: clamp01(point.x),
    y: clamp01(point.y),
  })) as DocumentCorners;
}

export type CropHandle =
  | "tl"
  | "tr"
  | "br"
  | "bl"
  | "left"
  | "right"
  | "top"
  | "bottom";

export function moveCropHandle(
  corners: DocumentCorners,
  handle: CropHandle,
  dx: number,
  dy: number
): DocumentCorners {
  const [tl, tr, br, bl] = corners.map((point) => ({ ...point })) as DocumentCorners;

  switch (handle) {
    case "tl":
      tl.x = clamp01(tl.x + dx);
      tl.y = clamp01(tl.y + dy);
      break;
    case "tr":
      tr.x = clamp01(tr.x + dx);
      tr.y = clamp01(tr.y + dy);
      break;
    case "br":
      br.x = clamp01(br.x + dx);
      br.y = clamp01(br.y + dy);
      break;
    case "bl":
      bl.x = clamp01(bl.x + dx);
      bl.y = clamp01(bl.y + dy);
      break;
    case "left": {
      const nextLeft = clamp01(tl.x + dx);
      const maxLeft = Math.min(tr.x, br.x) - MIN_EDGE;
      const left = Math.min(nextLeft, maxLeft);
      tl.x = left;
      bl.x = left;
      break;
    }
    case "right": {
      const nextRight = clamp01(tr.x + dx);
      const minRight = Math.max(tl.x, bl.x) + MIN_EDGE;
      const right = Math.max(nextRight, minRight);
      tr.x = right;
      br.x = right;
      break;
    }
    case "top": {
      const nextTop = clamp01(tl.y + dy);
      const maxTop = Math.min(bl.y, br.y) - MIN_EDGE;
      const top = Math.min(nextTop, maxTop);
      tl.y = top;
      tr.y = top;
      break;
    }
    case "bottom": {
      const nextBottom = clamp01(bl.y + dy);
      const minBottom = Math.max(tl.y, tr.y) + MIN_EDGE;
      const bottom = Math.max(nextBottom, minBottom);
      bl.y = bottom;
      br.y = bottom;
      break;
    }
  }

  return [tl, tr, br, bl];
}

export function midpoint(a: ScanPoint, b: ScanPoint): ScanPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function cornersToPolygon(corners: DocumentCorners): string {
  return corners.map((point) => `${point.x * 100},${point.y * 100}`).join(" ");
}

export function pixelCornersToNormalized(
  corners: ScanPoint[],
  width: number,
  height: number
): DocumentCorners {
  return orderCorners(
    corners.map((point) => ({
      x: point.x / width,
      y: point.y / height,
    }))
  );
}

export function normalizedCornersToPixels(
  corners: DocumentCorners,
  width: number,
  height: number
): ScanPoint[] {
  return corners.map((point) => ({
    x: point.x * width,
    y: point.y * height,
  }));
}
