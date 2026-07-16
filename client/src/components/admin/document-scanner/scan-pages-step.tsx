"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { renderScanPage } from "@/lib/document-scanner/image-processing";
import type { ScanPage } from "@/lib/document-scanner/types";

type ScanPagesStepProps = {
  pages: ScanPage[];
  onBack: () => void;
  onAddPicture: () => void;
  onUpload: () => void;
};

export function ScanPagesStep({
  pages,
  onBack,
  onAddPicture,
  onUpload,
}: ScanPagesStepProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.all(pages.map((page) => renderScanPage(page))).then((urls) => {
      if (active) setPreviews(urls);
    });
    return () => {
      active = false;
    };
  }, [pages]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <p className="text-sm font-semibold text-slate-900">PDF Preview</p>
        <Button
          type="button"
          className="rounded-full bg-[#cbab53] px-4 text-sm font-semibold text-slate-900 hover:bg-[#b89745]"
          onClick={onUpload}
        >
          <Upload className="size-4" />
          Upload
        </Button>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-5">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
              Page {index + 1}
            </div>
            <div className="p-4">
              {previews[index] ? (
                <img
                  src={previews[index]}
                  alt={`Scanned page ${index + 1}`}
                  className="mx-auto max-h-[52dvh] w-full rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  Rendering preview...
                </div>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-dashed border-slate-300 bg-white"
          onClick={onAddPicture}
        >
          <ImagePlus className="size-4" />
          Add Picture
        </Button>
      </div>
    </div>
  );
}
