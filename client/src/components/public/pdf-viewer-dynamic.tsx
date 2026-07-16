"use client";

import dynamic from "next/dynamic";
import type { PublicDocumentDownloadContext } from "@/lib/types";

const PdfViewerInner = dynamic(
  () => import("@/components/public/pdf-viewer").then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-[#3998eb]" />
          <p className="text-sm text-muted-foreground">Loading document viewer...</p>
        </div>
      </div>
    ),
  }
);

export function PdfViewerDynamic({
  pdfUrl,
  title,
  downloadContext,
}: {
  pdfUrl: string;
  title?: string;
  downloadContext?: PublicDocumentDownloadContext;
}) {
  return (
    <PdfViewerInner
      pdfUrl={pdfUrl}
      title={title}
      downloadContext={downloadContext}
    />
  );
}
