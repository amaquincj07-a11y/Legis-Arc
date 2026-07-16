import {
  computeWarpOutputSize,
  warpPerspectiveImageData,
} from "./document-detection";
import {
  normalizedCornersToPixels,
  orderCorners,
} from "./crop-geometry";
import type { ScanPage } from "./types";

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function getRotatedSize(
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized === 90 || normalized === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}

function drawRotatedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rotation: number
) {
  const { width, height } = getRotatedSize(img.width, img.height, rotation);
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  ctx.restore();
}

export async function renderRotatedSource(page: ScanPage): Promise<string> {
  const img = await loadImage(page.sourceDataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  drawRotatedImage(ctx, img, page.rotation);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function bakeCropIntoSource(
  page: ScanPage
): Promise<{ sourceDataUrl: string; rotation: number }> {
  if (!page.crop) {
    return { sourceDataUrl: page.sourceDataUrl, rotation: page.rotation };
  }

  const img = await loadImage(page.sourceDataUrl);
  const rotationCanvas = document.createElement("canvas");
  const rotationCtx = rotationCanvas.getContext("2d");
  if (!rotationCtx) throw new Error("Canvas not supported");

  drawRotatedImage(rotationCtx, img, page.rotation);
  const source = rotationCtx.getImageData(
    0,
    0,
    rotationCanvas.width,
    rotationCanvas.height
  );

  const pixelCorners = normalizedCornersToPixels(
    orderCorners(page.crop.corners),
    source.width,
    source.height
  );
  const { width, height } = computeWarpOutputSize(pixelCorners);
  const warped = warpPerspectiveImageData(source, pixelCorners, width, height);

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = width;
  cropCanvas.height = height;
  cropCanvas.getContext("2d")?.putImageData(warped, 0, 0);

  return {
    sourceDataUrl: cropCanvas.toDataURL("image/jpeg", 0.92),
    rotation: 0,
  };
}
