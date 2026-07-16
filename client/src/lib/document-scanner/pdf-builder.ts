import { renderScanPage } from "./image-processing";
import type { ScanPage } from "./types";

export async function buildPdfFromScanPages(
  pages: ScanPage[],
  fileName: string
): Promise<File> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  for (let index = 0; index < pages.length; index++) {
    if (index > 0) pdf.addPage();

    const dataUrl = await renderScanPage(pages[index]);
    const img = await loadImage(dataUrl);
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    pdf.addImage(dataUrl, "JPEG", x, y, width, height, undefined, "FAST");
  }

  const blob = pdf.output("blob");
  return new File([blob], fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`, {
    type: "application/pdf",
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
