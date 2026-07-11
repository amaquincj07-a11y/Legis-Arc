"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clampQuad,
  cornersToPolygon,
  midpoint,
  moveCropHandle,
  type CropHandle,
  type DocumentCorners,
} from "@/lib/document-scanner/crop-geometry";
import { getDefaultCrop } from "@/lib/document-scanner/image-processing";
import type { ScanCrop } from "@/lib/document-scanner/types";

type ScanCropOverlayProps = {
  crop: ScanCrop;
  onChange: (crop: ScanCrop) => void;
};

const CORNER_HANDLES: CropHandle[] = ["tl", "tr", "br", "bl"];
const EDGE_HANDLES: CropHandle[] = ["top", "right", "bottom", "left"];

export function ScanCropOverlay({ crop, onChange }: ScanCropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    handle: CropHandle;
    startX: number;
    startY: number;
    startCorners: DocumentCorners;
  } | null>(null);

  const [localCorners, setLocalCorners] = useState<DocumentCorners>(crop.corners);

  useEffect(() => {
    setLocalCorners(crop.corners);
  }, [crop.corners]);

  const commitCorners = useCallback(
    (next: DocumentCorners) => {
      const clamped = clampQuad(next);
      setLocalCorners(clamped);
      onChange({ corners: clamped });
    },
    [onChange]
  );

  function onPointerMove(event: React.PointerEvent) {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;

    const rect = container.getBoundingClientRect();
    const dx = (event.clientX - drag.startX) / rect.width;
    const dy = (event.clientY - drag.startY) / rect.height;
    const next = moveCropHandle(drag.startCorners, drag.handle, dx, dy);
    commitCorners(next);
  }

  function endDrag() {
    dragRef.current = null;
  }

  function startDrag(handle: CropHandle, event: React.PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startCorners: localCorners,
    };
  }

  const [tl, tr, br, bl] = localCorners;
  const topMid = midpoint(tl, tr);
  const rightMid = midpoint(tr, br);
  const bottomMid = midpoint(br, bl);
  const leftMid = midpoint(bl, tl);

  const handlePosition: Record<CropHandle, ScanCrop["corners"][0]> = {
    tl,
    tr,
    br,
    bl,
    top: topMid,
    right: rightMid,
    bottom: bottomMid,
    left: leftMid,
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-none"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <mask id="crop-mask">
            <rect width="100" height="100" fill="white" />
            <polygon points={cornersToPolygon(localCorners)} fill="black" />
          </mask>
        </defs>
        <rect width="100" height="100" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
        <polygon
          points={cornersToPolygon(localCorners)}
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
        <line x1={tl.x * 100} y1={tl.y * 100} x2={tr.x * 100} y2={tr.y * 100} stroke="rgba(255,255,255,0.35)" strokeWidth="0.15" />
        <line x1={tr.x * 100} y1={tr.y * 100} x2={br.x * 100} y2={br.y * 100} stroke="rgba(255,255,255,0.35)" strokeWidth="0.15" />
        <line x1={br.x * 100} y1={br.y * 100} x2={bl.x * 100} y2={bl.y * 100} stroke="rgba(255,255,255,0.35)" strokeWidth="0.15" />
        <line x1={bl.x * 100} y1={bl.y * 100} x2={tl.x * 100} y2={tl.y * 100} stroke="rgba(255,255,255,0.35)" strokeWidth="0.15" />
      </svg>

      {[...CORNER_HANDLES, ...EDGE_HANDLES].map((handle) => {
        const point = handlePosition[handle];
        const isCorner = CORNER_HANDLES.includes(handle);
        return (
          <div
            key={handle}
            onPointerDown={(event) => startDrag(handle, event)}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#2dd4bf] bg-white shadow-md ${
              isCorner ? "size-5 cursor-grab active:cursor-grabbing" : "size-4 cursor-grab active:cursor-grabbing"
            } ${handle === "left" || handle === "right" ? "cursor-ew-resize" : ""} ${
              handle === "top" || handle === "bottom" ? "cursor-ns-resize" : ""
            }`}
            style={{
              left: `${point.x * 100}%`,
              top: `${point.y * 100}%`,
            }}
            aria-label={`Adjust crop ${handle}`}
          />
        );
      })}
    </div>
  );
}

export function createInitialCrop(): ScanCrop {
  return getDefaultCrop();
}
