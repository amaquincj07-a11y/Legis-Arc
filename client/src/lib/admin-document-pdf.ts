"use client";

import { fetchOrdinanceByIdAction } from "@/lib/ordinance-actions";
import { fetchResolutionByIdAction } from "@/lib/resolution-actions";
import { fetchSessionMinutesByIdAction } from "@/lib/minutes-actions";
import { toast } from "sonner";

type PdfDocumentResult =
  | { success: true; data: { pdfUrl: string } }
  | { success: false; error: string };

function sanitizeDownloadName(title: string): string {
  const cleaned = title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").trim();
  return cleaned || "document";
}

async function downloadPdfFile(pdfUrl: string, title: string) {
  try {
    const response = await fetch(pdfUrl, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Download failed (${response.status})`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${sanitizeDownloadName(title)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Cross-origin `download` is ignored by browsers; open the file instead.
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    toast.message("Opened PDF in a new tab (direct download was blocked).");
  }
}

export async function openDocumentPdf(
  fetcher: () => Promise<PdfDocumentResult>,
  title: string,
  mode: "view" | "download",
  knownPdfUrl?: string
) {
  const existingUrl = knownPdfUrl?.trim();

  // Prefer a known URL so view/download stay inside the user gesture
  // (avoids popup blockers after an async server round-trip).
  if (existingUrl) {
    if (mode === "view") {
      window.open(existingUrl, "_blank", "noopener,noreferrer");
      return;
    }
    await downloadPdfFile(existingUrl, title);
    return;
  }

  // Open blank tab synchronously, then navigate after the fetch completes.
  const preview =
    mode === "view" ? window.open("about:blank", "_blank") : null;

  const result = await fetcher();
  if (!result.success || !result.data.pdfUrl?.trim()) {
    preview?.close();
    toast.error(result.success ? "PDF is not available." : result.error);
    return;
  }

  const pdfUrl = result.data.pdfUrl.trim();

  if (mode === "view") {
    if (preview && !preview.closed) {
      preview.location.href = pdfUrl;
    } else {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
    return;
  }

  await downloadPdfFile(pdfUrl, title);
}

export function openOrdinancePdf(
  id: string,
  title: string,
  mode: "view" | "download",
  knownPdfUrl?: string
) {
  return openDocumentPdf(
    () => fetchOrdinanceByIdAction(id),
    title,
    mode,
    knownPdfUrl
  );
}

export function openResolutionPdf(
  id: string,
  title: string,
  mode: "view" | "download",
  knownPdfUrl?: string
) {
  return openDocumentPdf(
    () => fetchResolutionByIdAction(id),
    title,
    mode,
    knownPdfUrl
  );
}

export function openMinutesPdf(
  id: string,
  title: string,
  mode: "view" | "download",
  knownPdfUrl?: string
) {
  return openDocumentPdf(
    () => fetchSessionMinutesByIdAction(id),
    title,
    mode,
    knownPdfUrl
  );
}
