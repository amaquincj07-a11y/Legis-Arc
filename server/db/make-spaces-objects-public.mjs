/**
 * Set ACL public-read on all objects already in the Spaces bucket.
 * Fixes AccessDenied on PDF/image CDN URLs for files uploaded without ACL.
 *
 * Run from repo root (uses root `.env`):
 *   node server/db/make-spaces-objects-public.mjs
 *
 * Or on the Droplet inside the api container / on the host with Spaces env loaded.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  ListObjectsV2Command,
  PutObjectAclCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(serverRoot, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env"), override: true });

const endpoint = process.env.SPACES_ENDPOINT?.trim().replace(/\s+/g, "");
const region = process.env.SPACES_REGION?.trim();
const bucket = process.env.SPACES_BUCKET?.trim();
const keyId = process.env.SPACES_KEY?.trim();
const secret = process.env.SPACES_SECRET?.trim();

if (!endpoint || !region || !bucket || !keyId || !secret) {
  console.error(
    "Missing Spaces env: SPACES_ENDPOINT, SPACES_REGION, SPACES_BUCKET, SPACES_KEY, SPACES_SECRET"
  );
  process.exit(1);
}

const client = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId: keyId, secretAccessKey: secret },
  forcePathStyle: false,
});

async function listAllKeys() {
  const keys = [];
  let token;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: token,
      })
    );
    for (const obj of page.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function main() {
  console.log(`Listing objects in s3://${bucket} …`);
  const keys = await listAllKeys();
  console.log(`Found ${keys.length} object(s). Setting ACL public-read…`);

  let ok = 0;
  let failed = 0;
  for (const key of keys) {
    try {
      await client.send(
        new PutObjectAclCommand({
          Bucket: bucket,
          Key: key,
          ACL: "public-read",
        })
      );
      ok += 1;
      console.log(`  ok  ${key}`);
    } catch (error) {
      failed += 1;
      console.error(`  fail ${key}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`Done. public-read=${ok}, failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
