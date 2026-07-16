/**
 * Upload existing local files from server/uploads to DigitalOcean Spaces
 * using the same relative keys already stored in Postgres.
 *
 * Requires STORAGE_DRIVER-compatible Spaces env vars in repo-root `.env`.
 * Does not modify the database.
 *
 * Run: node server/db/migrate-uploads-to-spaces.mjs
 *  or: node db/migrate-uploads-to-spaces.mjs  (from server/)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  PutObjectCommand,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(serverRoot, "..");
dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env"), override: true });

const uploadsRoot = path.join(serverRoot, "uploads");

const endpoint = process.env.SPACES_ENDPOINT?.trim();
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

if (!fs.existsSync(uploadsRoot)) {
  console.error(`Uploads folder not found: ${uploadsRoot}`);
  process.exit(1);
}

const client = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId: keyId, secretAccessKey: secret },
  forcePathStyle: false,
});

function walk(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) walk(abs, base, out);
    else if (st.isFile() && name !== ".gitkeep") {
      out.push({
        abs,
        key: path.relative(base, abs).split(path.sep).join("/"),
      });
    }
  }
  return out;
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

async function objectExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const files = walk(uploadsRoot);
  console.log(`Found ${files.length} file(s) under ${uploadsRoot}`);

  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    if (await objectExists(file.key)) {
      skipped += 1;
      console.log(`skip (exists): ${file.key}`);
      continue;
    }
    const body = fs.readFileSync(file.abs);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: file.key,
        Body: body,
        ContentType: guessContentType(file.abs),
        ACL: "public-read",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    uploaded += 1;
    console.log(`uploaded: ${file.key}`);
  }

  console.log(`Done. uploaded=${uploaded}, skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
