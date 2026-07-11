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

  const crop = page.crop;
  const sx = crop.x * rotationCanvas.width;
  const sy = crop.y * rotationCanvas.height;
  const sw = crop.width * rotationCanvas.width;
  const sh = crop.height * rotationCanvas.height;

  const cropCanvas = document.createElement("canvas");
  const cropCtx = cropCanvas.getContext("2d");
  if (!cropCtx) throw new Error("Canvas not supported");

  cropCanvas.width = Math.max(1, Math.round(sw));
  cropCanvas.height = Math.max(1, Math.round(sh));
  cropCtx.drawImage(
    rotationCanvas,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  return {
    sourceDataUrl: cropCanvas.toDataURL("image/jpeg", 0.92),
    rotation: 0,
  };
}
