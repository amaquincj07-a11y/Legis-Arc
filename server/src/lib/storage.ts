import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { spacesDeleteObject, spacesPutObject } from "./spaces.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");

export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export function toPublicStorageUrl(
  storagePath: string | null | undefined
): string {
  if (!storagePath) return "";
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  const cleaned = storagePath.replace(/^\/+/, "");

  if (env.storageDriver === "spaces") {
    return `${env.spaces.publicBaseUrl}/${cleaned}`;
  }

  return `${env.apiPublicUrl}/uploads/${cleaned}`;
}

export function absoluteLocalPath(relativePath: string): string {
  return path.join(UPLOADS_ROOT, ...relativePath.split("/"));
}

export async function putObject(input: PutObjectInput): Promise<void> {
  if (env.storageDriver === "spaces") {
    await spacesPutObject(input);
    return;
  }

  const abs = absoluteLocalPath(input.key);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, input.body);
}

export async function deleteObject(
  relativePath: string | null | undefined
): Promise<void> {
  if (!relativePath) return;
  const cleaned = relativePath.replace(/^\/+/, "");
  if (!cleaned || /^https?:\/\//i.test(cleaned)) return;

  try {
    if (env.storageDriver === "spaces") {
      await spacesDeleteObject(cleaned);
      return;
    }
    await fs.unlink(absoluteLocalPath(cleaned));
  } catch {
    /* ignore missing objects */
  }
}

/** Ensure local uploads root exists (local driver only). */
export async function ensureLocalUploadsRoot(): Promise<void> {
  if (env.storageDriver !== "local") return;
  await fs.mkdir(UPLOADS_ROOT, { recursive: true });
}
