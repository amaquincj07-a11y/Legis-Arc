"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ScanCrop } from "@/lib/document-scanner/types";
import { getDefaultCrop } from "@/lib/document-scanner/image-processing";

type ScanCropOverlayProps = {
  crop: ScanCrop;
  onChange: (crop: ScanCrop) => void;
};

type DragEdge = "left" | "right" | "top" | "bottom";

const MIN_SIZE = 0.12;

function clampCrop(next: ScanCrop): ScanCrop {
  const width = Math.max(MIN_SIZE, Math.min(1, next.width));
  const height = Math.max(MIN_SIZE, Math.min(1, next.height));
  const x = Math.max(0, Math.min(1 - width, next.x));
  const y = Math.max(0, Math.min(1 - height, next.y));
  return { x, y, width, height };
}

export function ScanCropOverlay({ crop, onChange }: ScanCropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    edge: DragEdge;
    startX: number;
    startY: number;
    startCrop: ScanCrop;
  } | null>(null);

  const [localCrop, setLocalCrop] = useState(crop);

  useEffect(() => {
    setLocalCrop(crop);
  }, [crop]);

  const commitCrop = useCallback(
    (next: ScanCrop) => {
      const clamped = clampCrop(next);
      setLocalCrop(clamped);
      onChange(clamped);
    },
    [onChange]
  );

  function startDrag(edge: DragEdge, clientX: number, clientY: number) {
    dragRef.current = {
      edge,
      startX: clientX,
      startY: clientY,
      startCrop: localCrop,
    };
  }

  function moveDrag(clientX: number, clientY: number) {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;

    const rect = container.getBoundingClientRect();
    const dx = (clientX - drag.startX) / rect.width;
    const dy = (clientY - drag.startY) / rect.height;
    const base = drag.startCrop;

    let next = { ...base };

    switch (drag.edge) {
      case "left":
        next = {
          ...base,
          x: base.x + dx,
          width: base.width - dx,
        };
        break;
      case "right":
        next = {
          ...base,
          width: base.width + dx,
        };
        break;
      case "top":
        next = {
          ...base,
          y: base.y + dy,
          height: base.height - dy,
        };
        break;
      case "bottom":
        next = {
          ...base,
          height: base.height + dy,
        };
        break;
    }

    commitCrop(next);
  }

  function endDrag() {
    dragRef.current = null;
  }

  const left = `${localCrop.x * 100}%`;
  const top = `${localCrop.y * 100}%`;
  const width = `${localCrop.width * 100}%`;
  const height = `${localCrop.height * 100}%`;
  const right = `${(1 - localCrop.x - localCrop.width) * 100}%`;
  const bottom = `${(1 - localCrop.y - localCrop.height) * 100}%`;

  const handleProps = (edge: DragEdge) => ({
    onPointerDown: (event: React.PointerEvent) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      startDrag(edge, event.clientX, event.clientY);
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (!dragRef.current || dragRef.current.edge !== edge) return;
      moveDrag(event.clientX, event.clientY);
    },
    onPointerUp: (event: React.PointerEvent) => {
      event.currentTarget.releasePointerCapture(event.pointerId);
      endDrag();
    },
    onPointerCancel: () => endDrag(),
  });

  return (
    <div ref={containerRef} className="absolute inset-0 touch-none">
      <div className="absolute inset-x-0 top-0 bg-black/55" style={{ height: top }} />
      <div
        className="absolute inset-x-0 bottom-0 bg-black/55"
        style={{ height: bottom }}
      />
      <div
        className="absolute left-0 bg-black/55"
        style={{ top, height, width: left }}
      />
      <div
        className="absolute right-0 bg-black/55"
        style={{ top, height, width: right }}
      />

      <div
        className="absolute border-2 border-[#2dd4bf]"
        style={{ left, top, width, height }}
      >
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="border border-white/50" />
          ))}
        </div>
      </div>

      <div
        {...handleProps("left")}
        className="absolute z-10 w-10 cursor-ew-resize"
        style={{ left, top, height, transform: "translateX(-50%)" }}
        aria-label="Crop left edge"
      />

      <div
        {...handleProps("right")}
        className="absolute z-10 w-10 cursor-ew-resize"
        style={{
          left: `calc(${localCrop.x * 100}% + ${localCrop.width * 100}%)`,
          top,
          height,
          transform: "translateX(-50%)",
        }}
        aria-label="Crop right edge"
      />

      <div
        {...handleProps("top")}
        className="absolute z-10 h-10 cursor-ns-resize"
        style={{ left, top, width, transform: "translateY(-50%)" }}
        aria-label="Crop top edge"
      />

      <div
        {...handleProps("bottom")}
        className="absolute z-10 h-10 cursor-ns-resize"
        style={{
          left,
          top: `calc(${localCrop.y * 100}% + ${localCrop.height * 100}%)`,
          width,
          transform: "translateY(-50%)",
        }}
        aria-label="Crop bottom edge"
      />
    </div>
  );
}

export function createInitialCrop(): ScanCrop {
  return getDefaultCrop();
}
