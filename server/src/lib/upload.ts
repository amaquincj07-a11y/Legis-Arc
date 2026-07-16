import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "../config/env.js";
import { deleteObject, putObject, UPLOADS_ROOT } from "./storage.js";
import { AppError } from "../utils/errors.js";
import fs from "node:fs";

export { UPLOADS_ROOT };

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export type UploadKind =
  | "ordinances"
  | "resolutions"
  | "minutes"
  | "sb-members";

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

if (env.storageDriver === "local") {
  ensureDir(UPLOADS_ROOT);
}

export function buildRelativeUploadPath(
  lguId: string,
  kind: UploadKind,
  filename: string
): string {
  return path.posix.join(lguId, kind, filename);
}

/** @deprecated use deleteStoredFile — kept as async-compatible alias */
export async function deleteUploadedFile(
  relativePath: string | null | undefined
): Promise<void> {
  await deleteObject(relativePath);
}

export const deleteStoredFile = deleteUploadedFile;

function diskStorageFor(kind: UploadKind) {
  return multer.diskStorage({
    destination(req, _file, cb) {
      const lguId = req.auth?.profile.lgu_id;
      if (!lguId) {
        cb(new AppError("LGU context required for upload", 401), "");
        return;
      }
      const dest = path.join(UPLOADS_ROOT, lguId, kind);
      ensureDir(dest);
      cb(null, dest);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase() || ".bin";
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

function pdfFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
  ) {
    cb(null, true);
    return;
  }
  cb(new AppError("Only PDF files are accepted.", 400));
}

function imageFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new AppError("Only image files are accepted.", 400));
}

/**
 * After memory upload (Spaces), push the buffer to object storage and
 * assign `file.filename` so controllers can keep using relativePathFromFile.
 */
function persistSpacesFile(kind: UploadKind): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        next();
        return;
      }
      const lguId = req.auth?.profile.lgu_id;
      if (!lguId) {
        next(new AppError("LGU context required for upload", 401));
        return;
      }
      if (!file.buffer) {
        next(new AppError("Upload buffer missing for Spaces storage", 500));
        return;
      }

      const ext = path.extname(file.originalname).toLowerCase() || ".bin";
      const filename = `${randomUUID()}${ext}`;
      const key = buildRelativeUploadPath(lguId, kind, filename);

      await putObject({
        key,
        body: file.buffer,
        contentType: file.mimetype || "application/octet-stream",
      });

      file.filename = filename;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function buildUploader(
  kind: UploadKind,
  fileFilter: typeof pdfFilter
) {
  const useSpaces = env.storageDriver === "spaces";
  const upload = multer({
    storage: useSpaces ? multer.memoryStorage() : diskStorageFor(kind),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter,
  });

  return {
    single(field: string): RequestHandler[] {
      if (useSpaces) {
        return [upload.single(field), persistSpacesFile(kind)];
      }
      return [upload.single(field)];
    },
  };
}

export const pdfUpload = (kind: UploadKind) =>
  buildUploader(kind, pdfFilter);

export const imageUpload = (kind: UploadKind) =>
  buildUploader(kind, imageFilter);

/** Relative object key from multer file (local disk or Spaces). */
export function relativePathFromFile(
  lguId: string,
  kind: UploadKind,
  file: Express.Multer.File
): string {
  return buildRelativeUploadPath(lguId, kind, file.filename);
}
