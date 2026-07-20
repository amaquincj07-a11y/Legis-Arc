import { MAX_FILE_SIZE } from "@/lib/constants";

export type PendingUploadKind = "ordinance" | "resolution" | "minutes";

const pendingByKind = new Map<PendingUploadKind, File>();

export type PdfValidationResult =
  | { ok: true; file: File }
  | { ok: false; error: string };

export function validatePdfFile(file: File): PdfValidationResult {
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Only PDF files are accepted" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "File size must be less than 25MB" };
  }
  return { ok: true, file };
}

/** Hold a PDF chosen from the list "Upload New" flow until the form page mounts. */
export function setPendingUpload(kind: PendingUploadKind, file: File) {
  pendingByKind.set(kind, file);
}

/** Read and clear the pending PDF for this upload kind (one-shot). */
export function takePendingUpload(kind: PendingUploadKind): File | null {
  const file = pendingByKind.get(kind) ?? null;
  pendingByKind.delete(kind);
  return file;
}
