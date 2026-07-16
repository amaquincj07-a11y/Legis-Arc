export type VideoCropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Maps a on-screen rectangle to source pixels for a video using object-cover. */
export function mapDisplayRectToVideoCrop(
  video: HTMLVideoElement,
  targetRect: DOMRect,
  videoElementRect: DOMRect
): VideoCropRect {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;

  if (sourceWidth === 0 || sourceHeight === 0) {
    return { x: 0, y: 0, width: sourceWidth, height: sourceHeight };
  }

  const elementWidth = videoElementRect.width;
  const elementHeight = videoElementRect.height;
  const scale = Math.max(elementWidth / sourceWidth, elementHeight / sourceHeight);
  const displayedWidth = sourceWidth * scale;
  const displayedHeight = sourceHeight * scale;
  const offsetX = (elementWidth - displayedWidth) / 2;
  const offsetY = (elementHeight - displayedHeight) / 2;

  const relLeft = targetRect.left - videoElementRect.left;
  const relTop = targetRect.top - videoElementRect.top;

  const sourceX = (relLeft - offsetX) / scale;
  const sourceY = (relTop - offsetY) / scale;
  const sourceW = targetRect.width / scale;
  const sourceH = targetRect.height / scale;

  const x = Math.max(0, Math.min(sourceWidth - 1, sourceX));
  const y = Math.max(0, Math.min(sourceHeight - 1, sourceY));
  const width = Math.max(1, Math.min(sourceWidth - x, sourceW));
  const height = Math.max(1, Math.min(sourceHeight - y, sourceH));

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function captureVideoCroppedToGuide(
  video: HTMLVideoElement,
  guideElement: HTMLElement,
  quality = 0.92
): string | null {
  const videoRect = video.getBoundingClientRect();
  const guideRect = guideElement.getBoundingClientRect();

  if (guideRect.width < 8 || guideRect.height < 8) return null;

  const crop = mapDisplayRectToVideoCrop(video, guideRect, videoRect);

  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(
    video,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return canvas.toDataURL("image/jpeg", quality);
}
