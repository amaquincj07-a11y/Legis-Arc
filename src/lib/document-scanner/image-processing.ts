import { applyCamScannerBw } from "./bw-filter";
import { applyCamScannerEnhance } from "./enhance-filter";
import { applyCamScannerLighten } from "./lighten-filter";
import { applyCamScannerNoShadow } from "./no-shadow-filter";
import type {
  ScanAdjustments,
  ScanCrop,
  ScanFilterPreset,
  ScanPage,
} from "./types";

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

function getPresetAdjustments(filter: ScanFilterPreset): ScanAdjustments {
  switch (filter) {
    case "lightning":
      return { contrast: 0, brightness: 0, details: 6 };
    case "enhance":
      return { contrast: 0, brightness: 0, details: 10 };
    case "no-shadow":
      return { contrast: 0, brightness: 0, details: 6 };
    case "bw":
      return { contrast: 0, brightness: 0, details: 8 };
    default:
      return { contrast: 0, brightness: 0, details: 0 };
  }
}

function applyPixelAdjustments(
  imageData: ImageData,
  filter: ScanFilterPreset,
  adjustments: ScanAdjustments
) {
  const preset = getPresetAdjustments(filter);
  const contrast =
    1 + (preset.contrast + adjustments.contrast) / 100;
  const brightness = preset.brightness + adjustments.brightness;
  const details = (preset.details + adjustments.details) / 100;
  const data = imageData.data;
  const grayscale = filter === "bw";

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = gray;
    }

    r = (r - 128) * contrast + 128 + brightness;
    g = (g - 128) * contrast + 128 + brightness;
    b = (b - 128) * contrast + 128 + brightness;

    if (details > 0) {
      r = r + (r - 128) * details;
      g = g + (g - 128) * details;
      b = b + (b - 128) * details;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }
}

export async function renderScanPage(page: ScanPage): Promise<string> {
  const img = await loadImage(page.sourceDataUrl);
  const rotationCanvas = document.createElement("canvas");
  const rotationCtx = rotationCanvas.getContext("2d");
  if (!rotationCtx) throw new Error("Canvas not supported");

  drawRotatedImage(rotationCtx, img, page.rotation);

  let workingCanvas = rotationCanvas;
  if (page.crop) {
    const cropCanvas = document.createElement("canvas");
    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) throw new Error("Canvas not supported");

    const crop = page.crop;
    const sx = crop.x * workingCanvas.width;
    const sy = crop.y * workingCanvas.height;
    const sw = crop.width * workingCanvas.width;
    const sh = crop.height * workingCanvas.height;

    cropCanvas.width = Math.max(1, Math.round(sw));
    cropCanvas.height = Math.max(1, Math.round(sh));
    cropCtx.drawImage(
      workingCanvas,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );
    workingCanvas = cropCanvas;
  }

  const outputCtx = workingCanvas.getContext("2d");
  if (!outputCtx) throw new Error("Canvas not supported");

  const imageData = outputCtx.getImageData(
    0,
    0,
    workingCanvas.width,
    workingCanvas.height
  );

  if (page.filter === "lightning") {
    const preset = getPresetAdjustments("lightning");
    applyCamScannerLighten(imageData, {
      contrast: preset.contrast + page.adjustments.contrast,
      brightness: preset.brightness + page.adjustments.brightness,
      details: preset.details + page.adjustments.details,
    });
  } else if (page.filter === "enhance") {
    const preset = getPresetAdjustments("enhance");
    applyCamScannerEnhance(imageData, {
      contrast: preset.contrast + page.adjustments.contrast,
      brightness: preset.brightness + page.adjustments.brightness,
      details: preset.details + page.adjustments.details,
    });
  } else if (page.filter === "bw") {
    const preset = getPresetAdjustments("bw");
    applyCamScannerBw(imageData, {
      contrast: preset.contrast + page.adjustments.contrast,
      brightness: preset.brightness + page.adjustments.brightness,
      details: preset.details + page.adjustments.details,
    });
  } else if (page.filter === "no-shadow") {
    const preset = getPresetAdjustments("no-shadow");
    applyCamScannerNoShadow(imageData, {
      contrast: preset.contrast + page.adjustments.contrast,
      brightness: preset.brightness + page.adjustments.brightness,
      details: preset.details + page.adjustments.details,
    });
  } else {
    applyPixelAdjustments(imageData, page.filter, page.adjustments);
  }

  outputCtx.putImageData(imageData, 0, 0);

  return workingCanvas.toDataURL("image/jpeg", 0.92);
}

export function getDefaultCrop(): ScanCrop {
  return { x: 0.05, y: 0.05, width: 0.9, height: 0.9 };
}
