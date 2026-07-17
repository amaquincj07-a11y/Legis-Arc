import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const SPACES_REQUEST_TIMEOUT_MS = 60_000;

let client: S3Client | null = null;

export function getSpacesClient(): S3Client {
  if (client) return client;
  if (env.storageDriver !== "spaces") {
    throw new Error("Spaces client requested while STORAGE_DRIVER is not spaces");
  }
  client = new S3Client({
    endpoint: env.spaces.endpoint,
    region: env.spaces.region,
    credentials: {
      accessKeyId: env.spaces.key,
      secretAccessKey: env.spaces.secret,
    },
    forcePathStyle: false,
  });
  return client;
}

export async function spacesPutObject(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  const s3 = getSpacesClient();
  // Do not send ACL — modern Spaces/S3 buckets with Object Ownership
  // "Bucket owner enforced" reject PutObject with ACL.
  // Public reads come from the bucket policy / CDN settings instead.
  await s3.send(
    new PutObjectCommand({
      Bucket: env.spaces.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { abortSignal: AbortSignal.timeout(SPACES_REQUEST_TIMEOUT_MS) }
  );
}

export async function spacesDeleteObject(key: string): Promise<void> {
  const s3 = getSpacesClient();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.spaces.bucket,
      Key: key,
    }),
    { abortSignal: AbortSignal.timeout(SPACES_REQUEST_TIMEOUT_MS) }
  );
}
