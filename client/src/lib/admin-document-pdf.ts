"use client";

import { fetchOrdinanceByIdAction } from "@/lib/ordinance-actions";
import { fetchResolutionByIdAction } from "@/lib/resolution-actions";
import { fetchSessionMinutesByIdAction } from "@/lib/minutes-actions";
import { toast } from "sonner";

type PdfDocumentResult =
  | { success: true; data: { pdfUrl: string } }
  | { success: false; error: string };

export async function openDocumentPdf(
  fetcher: () => Promise<PdfDocumentResult>,
  title: string,
  mode: "view" | "download"
) {
  const result = await fetcher();
  if (!result.success || !result.data.pdfUrl) {
    toast.error(result.success ? "PDF is not available." : result.error);
    return;
  }

  if (mode === "view") {
    window.open(result.data.pdfUrl, "_blank");
    return;
  }

  const link = document.createElement("a");
  link.href = result.data.pdfUrl;
  link.download = `${title}.pdf`;
  link.click();
}

export function openOrdinancePdf(
  id: string,
  title: string,
  mode: "view" | "download"
) {
  return openDocumentPdf(() => fetchOrdinanceByIdAction(id), title, mode);
}

export function openResolutionPdf(
  id: string,
  title: string,
  mode: "view" | "download"
) {
  return openDocumentPdf(() => fetchResolutionByIdAction(id), title, mode);
}

export function openMinutesPdf(
  id: string,
  title: string,
  mode: "view" | "download"
) {
  return openDocumentPdf(() => fetchSessionMinutesByIdAction(id), title, mode);
}
