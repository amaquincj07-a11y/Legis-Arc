import { orderCorners } from "./crop-geometry";
import {
  detectDocumentCornersFromImageData,
  computeWarpOutputSize,
  warpPerspectiveImageData,
} from "./document-detection";

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Detects document edges and applies perspective rectification (CamScanner-style).
 * Optionally uses pre-detected corner points from the live camera overlay.
 */
export async function correctDocumentPerspective(
  dataUrl: string,
  pixelCorners?: { x: number; y: number }[] | null
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const corners =
    pixelCorners && pixelCorners.length === 4
      ? orderCorners(pixelCorners)
      : detectDocumentCornersFromImageData(source);

  if (!corners) return dataUrl;

  const { width, height } = computeWarpOutputSize(corners);
  const warped = warpPerspectiveImageData(source, corners, width, height);

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  output.getContext("2d")?.putImageData(warped, 0, 0);
  return output.toDataURL("image/jpeg", 0.92);
}

export {
  detectDocumentCornersFromImageData,
  detectDocumentCornersFromVideo,
  getVideoContentRect,
  mapVideoCornersToDisplay,
  smoothCorners,
} from "./document-detection";
