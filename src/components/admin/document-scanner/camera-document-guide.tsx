"use client";

import { forwardRef } from "react";

/** US Legal / bond paper — 21.59 cm × 35.56 cm (portrait). */
export const LEGAL_PAPER_WIDTH_CM = 21.59;
export const LEGAL_PAPER_HEIGHT_CM = 35.56;
export const LEGAL_PAPER_LABEL = "21.59 cm × 35.56 cm";
export const LEGAL_PAPER_ASPECT = LEGAL_PAPER_WIDTH_CM / LEGAL_PAPER_HEIGHT_CM;

type CameraDocumentGuideProps = {
  className?: string;
};

export const CameraDocumentGuide = forwardRef<HTMLDivElement, CameraDocumentGuideProps>(
  function CameraDocumentGuide({ className }, ref) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center p-1 sm:p-2 ${className ?? ""}`}
        aria-hidden
      >
        <div className="relative h-full w-full">
          <div
            ref={ref}
            className="absolute left-1/2 top-1/2 aspect-[2159/3556] h-[96%] w-auto max-w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.38)]"
          />
          <span className="absolute left-1/2 top-[2%] -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-white/85 sm:text-xs">
            Legal · {LEGAL_PAPER_LABEL}
          </span>
        </div>
      </div>
    );
  }
);
