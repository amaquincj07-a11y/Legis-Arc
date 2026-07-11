"use client";

import { useEffect, useRef } from "react";

import {
  detectDocumentCornersFromVideo,
  mapVideoCornersToDisplay,
  smoothCorners,
} from "@/lib/document-scanner/perspective-correction";
import type { ScanPoint } from "@/lib/document-scanner/types";

type CameraDetectionOverlayProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDetectedChange: (detected: boolean) => void;
  onCornersChange: (corners: ScanPoint[] | null) => void;
  enabled: boolean;
};

export function CameraDetectionOverlay({
  videoRef,
  onDetectedChange,
  onCornersChange,
  enabled,
}: CameraDetectionOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stableCornersRef = useRef<ScanPoint[] | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      onDetectedChange(false);
      onCornersChange(null);
      stableCornersRef.current = null;
      return;
    }

    let active = true;

    function tick(now: number) {
      if (!active) return;
      rafRef.current = requestAnimationFrame(tick);

      if (now - lastRunRef.current < 280) return;
      lastRunRef.current = now;

      const video = videoRef.current;
      const svg = svgRef.current;
      if (!video || !svg || video.videoWidth === 0) return;

      const rawCorners = detectDocumentCornersFromVideo(video);
      const smoothed = smoothCorners(stableCornersRef.current, rawCorners, 0.4);
      stableCornersRef.current = smoothed;

      const hasDetection = Boolean(smoothed && smoothed.length === 4);
      onDetectedChange(hasDetection);
      onCornersChange(smoothed);

      if (!hasDetection || !smoothed) {
        svg.innerHTML = "";
        return;
      }

      const displayCorners = mapVideoCornersToDisplay(smoothed, video);
      const parent = video.getBoundingClientRect();
      const color = "#2dd4bf";
      const points = displayCorners
        .map((point) => `${point.x - parent.left},${point.y - parent.top}`)
        .join(" ");

      svg.setAttribute("width", String(parent.width));
      svg.setAttribute("height", String(parent.height));
      svg.innerHTML = `
        <polygon points="${points}" fill="rgba(45,212,191,0.12)" stroke="${color}" stroke-width="3" />
        ${displayCorners
          .map(
            (point) =>
              `<circle cx="${point.x - parent.left}" cy="${point.y - parent.top}" r="7" fill="white" stroke="${color}" stroke-width="2.5" />`
          )
          .join("")}
      `;
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, videoRef, onDetectedChange, onCornersChange]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-10 overflow-visible"
      aria-hidden
    />
  );
}
