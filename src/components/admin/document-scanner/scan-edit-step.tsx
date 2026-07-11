"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Crop, RotateCw, X } from "lucide-react";

import { ScanAdjustmentPanel } from "@/components/admin/document-scanner/scan-adjustment-panel";
import { ScanCropOverlay } from "@/components/admin/document-scanner/scan-crop-overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bakeCropIntoSource, renderRotatedSource } from "@/lib/document-scanner/crop-utils";
import { pixelCornersToNormalized } from "@/lib/document-scanner/crop-geometry";
import { detectDocumentCornersFromImageData } from "@/lib/document-scanner/perspective-correction";
import {
  getDefaultCrop,
  renderScanPage,
} from "@/lib/document-scanner/image-processing";
import {
  DEFAULT_ADJUSTMENTS,
  FILTER_LABELS,
  type ScanAdjustments,
  type ScanCrop,
  type ScanFilterPreset,
  type ScanPage,
} from "@/lib/document-scanner/types";

const FILTER_OPTIONS: ScanFilterPreset[] = [
  "original",
  "lightning",
  "enhance",
  "no-shadow",
  "bw",
];

type ScanEditStepProps = {
  page: ScanPage;
  onChange: (page: ScanPage) => void;
  onBack: () => void;
  onRetake: () => void;
  onAdd: () => void;
};

export function ScanEditStep({
  page,
  onChange,
  onBack,
  onRetake,
  onAdd,
}: ScanEditStepProps) {
  const [previewUrl, setPreviewUrl] = useState(page.sourceDataUrl);
  const [adjustingFilter, setAdjustingFilter] = useState<ScanFilterPreset | null>(
    null
  );
  const [draftAdjustments, setDraftAdjustments] = useState<ScanAdjustments>(
    page.adjustments
  );
  const [cropMode, setCropMode] = useState(false);
  const [draftCrop, setDraftCrop] = useState<ScanCrop>(getDefaultCrop());
  const [applyingCrop, setApplyingCrop] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      if (cropMode) {
        const url = await renderRotatedSource(page);
        if (active) setPreviewUrl(url);
        return;
      }

      const previewPage =
        adjustingFilter !== null
          ? {
              ...page,
              filter: adjustingFilter,
              adjustments: draftAdjustments,
            }
          : page;

      const url = await renderScanPage(previewPage);
      if (active) setPreviewUrl(url);
    }

    void loadPreview();

    return () => {
      active = false;
    };
  }, [page, adjustingFilter, draftAdjustments, cropMode]);

  function updatePage(patch: Partial<ScanPage>) {
    onChange({ ...page, ...patch });
  }

  function openAdjustments(filter: ScanFilterPreset) {
    setAdjustingFilter(filter);
    setDraftAdjustments(page.adjustments);
    updatePage({ filter });
  }

  function applyAdjustments() {
    if (!adjustingFilter) return;
    updatePage({
      filter: adjustingFilter,
      adjustments: draftAdjustments,
    });
    setAdjustingFilter(null);
  }

  function cancelAdjustments() {
    setAdjustingFilter(null);
    setDraftAdjustments(page.adjustments);
  }

  async function enterCropMode() {
    setCropMode(true);
    if (page.crop) {
      setDraftCrop(page.crop);
      return;
    }

    try {
      const url = await renderRotatedSource(page);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setDraftCrop(getDefaultCrop());
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const corners = detectDocumentCornersFromImageData(imageData);

      if (corners && corners.length === 4) {
        setDraftCrop({
          corners: pixelCornersToNormalized(corners, canvas.width, canvas.height),
        });
      } else {
        setDraftCrop(getDefaultCrop());
      }
    } catch {
      setDraftCrop(getDefaultCrop());
    }
  }

  function cancelCrop() {
    setCropMode(false);
    setDraftCrop(page.crop ?? getDefaultCrop());
  }

  async function applyCrop() {
    setApplyingCrop(true);
    try {
      const baked = await bakeCropIntoSource({ ...page, crop: draftCrop });
      updatePage({
        sourceDataUrl: baked.sourceDataUrl,
        rotation: baked.rotation,
        crop: null,
      });
      setCropMode(false);
    } finally {
      setApplyingCrop(false);
    }
  }

  const panelMode = adjustingFilter !== null || cropMode;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#101B29] text-white">
      <header className="flex shrink-0 items-center justify-between px-4 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={onBack}
          aria-label="Go back"
          disabled={applyingCrop}
        >
          <ArrowLeft className="size-5" />
        </Button>
        {!panelMode && (
          <Button
            type="button"
            size="icon"
            className="size-10 rounded-full bg-[#cbab53] text-slate-900 hover:bg-[#b89745]"
            onClick={onAdd}
            aria-label="Confirm page"
          >
            <Check className="size-5 stroke-[2.5]" />
          </Button>
        )}
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4">
        <div className="relative inline-block max-h-full max-w-full">
          <img
            src={previewUrl}
            alt="Scanned page preview"
            className="block max-h-full max-w-full rounded-xl object-contain shadow-2xl"
          />
          {cropMode && (
            <ScanCropOverlay crop={draftCrop} onChange={setDraftCrop} />
          )}
        </div>
      </div>

      <div className="shrink-0 pt-1">
        {adjustingFilter !== null ? (
          <ScanAdjustmentPanel
            adjustments={draftAdjustments}
            onChange={setDraftAdjustments}
            onCancel={cancelAdjustments}
            onApply={applyAdjustments}
          />
        ) : cropMode ? (
          <div className="bg-black pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <p className="mb-4 text-center text-xs text-white/60">
              Drag edges or corners independently to adjust the document bounds
            </p>
            <div className="flex items-center justify-between px-5 pb-2">
              <button
                type="button"
                onClick={cancelCrop}
                disabled={applyingCrop}
                className="flex size-11 items-center justify-center text-white/90 transition hover:text-white disabled:opacity-50"
                aria-label="Cancel crop"
              >
                <X className="size-7 stroke-[2.5]" />
              </button>
              <span className="text-sm font-medium text-white/80">Crop</span>
              <button
                type="button"
                onClick={() => void applyCrop()}
                disabled={applyingCrop}
                className="flex size-11 items-center justify-center text-white/90 transition hover:text-white disabled:opacity-50"
                aria-label="Save crop"
              >
                <Check className="size-7 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="space-y-1.5">
              <p className="text-center text-[10px] text-white/60 sm:text-[11px]">
                Double-tap a filter to fine-tune contrast, brightness, and details
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      updatePage({
                        filter,
                        adjustments: { ...DEFAULT_ADJUSTMENTS },
                      })
                    }
                    onDoubleClick={() => openAdjustments(filter)}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition",
                      page.filter === filter
                        ? "bg-[#cbab53] text-slate-900"
                        : "bg-white/10 text-white hover:bg-white/15"
                    )}
                  >
                    {FILTER_LABELS[filter]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-10 rounded-xl bg-white/10 text-white hover:bg-white/15 sm:h-11"
                onClick={onRetake}
              >
                Retake
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-10 rounded-xl bg-white/10 text-white hover:bg-white/15 sm:h-11"
                onClick={() =>
                  updatePage({ rotation: (page.rotation + 90) % 360 })
                }
              >
                <RotateCw className="size-4" />
                Rotate
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-10 rounded-xl bg-white/10 text-white hover:bg-white/15 sm:h-11"
                onClick={() => void enterCropMode()}
              >
                <Crop className="size-4" />
                Crop
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
