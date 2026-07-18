"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type AdminPdfPreviewProps = {
  /** Remote URL (existing document) or local File (new/replacement upload). */
  source: string | File;
  title?: string;
  className?: string;
};

export function AdminPdfPreview({
  source,
  title,
  className,
}: AdminPdfPreviewProps) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof source === "string") {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(source);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [source]);

  const file = typeof source === "string" ? source : objectUrl;

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages);
    },
    []
  );

  const onDocumentLoadError = useCallback(() => {
    setNumPages(0);
  }, []);

  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages]
  );

  if (!file) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground">
        Preparing PDF preview…
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-white"
          : className
      }
    >
      <div
        className={
          isFullscreen
            ? "flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-white"
            : "overflow-hidden rounded-md border border-border bg-white"
        }
      >
        <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {numPages > 0
              ? `${numPages} page${numPages > 1 ? "s" : ""}`
              : "—"}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Zoom out"
              onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-12 text-center text-xs font-medium text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Zoom in"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}
              disabled={scale >= 2.5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => setIsFullscreen((f) => !f)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div
          className={
            isFullscreen
              ? "flex-1 overflow-auto bg-gray-100"
              : "overflow-auto bg-gray-100"
          }
          style={isFullscreen ? undefined : { maxHeight: "75vh" }}
        >
          <div className="flex flex-col items-center gap-4 py-4">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex h-96 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-[#3998eb]" />
                    <p className="text-sm text-muted-foreground">
                      Loading document…
                    </p>
                  </div>
                </div>
              }
              error={
                <div className="flex h-96 items-center justify-center px-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Unable to load PDF preview. Try downloading the file or
                    re-upload.
                  </p>
                </div>
              }
            >
              {pageNumbers.map((page) => (
                <Page
                  key={page}
                  pageNumber={page}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-md"
                  loading={
                    <div className="flex h-96 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-[#3998eb]" />
                    </div>
                  }
                />
              ))}
            </Document>
          </div>
        </div>

        {title ? (
          <div className="border-t bg-muted/30 px-3 py-2">
            <p className="truncate text-center text-xs text-muted-foreground">
              {title}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
