"use client";

import { useState, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentDownloadDialog } from "@/components/public/document-download-dialog";
import type { PublicDocumentDownloadContext } from "@/lib/types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
  downloadContext?: PublicDocumentDownloadContext;
}

export function PdfViewer({ pdfUrl, title, downloadContext }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setNumPages(0);
  }, []);

  const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages],
  );

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-white"
          : "flex flex-col"
      }
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {numPages > 0 ? `${numPages} page${numPages > 1 ? "s" : ""}` : "—"}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            aria-label="Download PDF"
            onClick={() => setShowDownloadDialog(true)}
            disabled={!downloadContext}
          >
            <Download className="mr-1 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-12 text-center text-xs font-medium text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={scale >= 2.5}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {downloadContext ? (
        <DocumentDownloadDialog
          open={showDownloadDialog}
          onOpenChange={setShowDownloadDialog}
          downloadContext={downloadContext}
          downloadFileName={title}
        />
      ) : null}

      <div
        className={
          isFullscreen
            ? "flex-1 overflow-auto bg-gray-100"
            : "overflow-auto bg-gray-100"
        }
        style={isFullscreen ? undefined : { maxHeight: "75vh" }}
      >
        <div
          className="flex select-none flex-col items-center gap-4 py-4"
          style={{ userSelect: "none" }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-[#3998eb]" />
                  <p className="text-sm text-muted-foreground">Loading document...</p>
                </div>
              </div>
            }
            error={
              <div className="flex h-96 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Unable to load document. Please try again later.
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

      {title && (
        <div className="border-t bg-muted/30 px-3 py-2">
          <p className="truncate text-center text-xs text-muted-foreground">{title}</p>
        </div>
      )}
    </div>
  );
}
