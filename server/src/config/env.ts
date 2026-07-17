import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "../..");
const repoRoot = path.resolve(serverRoot, "..");

// Prefer repo-root `.env` so client middleware and API always share one JWT_SECRET.
dotenv.config({ path: path.join(serverRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env"), override: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  API_PUBLIC_URL: z.string().optional(),
  STORAGE_DRIVER: z.enum(["local", "spaces"]).default("local"),
  SPACES_ENDPOINT: z.string().optional(),
  SPACES_REGION: z.string().optional(),
  SPACES_BUCKET: z.string().optional(),
  SPACES_KEY: z.string().optional(),
  SPACES_SECRET: z.string().optional(),
  /** Public CDN or bucket base URL (no trailing slash), e.g. https://bucket.sgp1.cdn.digitaloceanspaces.com */
  SPACES_CDN_URL: z.string().optional(),
  /** Fallback public base if CDN not set: https://bucket.region.digitaloceanspaces.com */
  SPACES_PUBLIC_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten());
  console.error(
    "Copy `.env.example` to `.env` and set DATABASE_URL and JWT_SECRET."
  );
  process.exit(1);
}

const raw = parsed.data;
const jwtSecret = raw.JWT_SECRET.trim();
const corsOrigin =
  raw.CORS_ORIGIN?.trim() ||
  raw.FRONTEND_URL?.trim() ||
  "http://localhost:3000";
const storageDriver = raw.STORAGE_DRIVER;

if (jwtSecret.length < 8) {
  console.error("JWT_SECRET must be at least 8 characters after trim.");
  process.exit(1);
}

if (storageDriver === "spaces") {
  const missing = [
    ["SPACES_ENDPOINT", raw.SPACES_ENDPOINT],
    ["SPACES_REGION", raw.SPACES_REGION],
    ["SPACES_BUCKET", raw.SPACES_BUCKET],
    ["SPACES_KEY", raw.SPACES_KEY],
    ["SPACES_SECRET", raw.SPACES_SECRET],
  ].filter(([, v]) => !v?.trim());

  if (missing.length > 0) {
    console.error(
      `STORAGE_DRIVER=spaces requires: ${missing.map(([k]) => k).join(", ")}`
    );
    process.exit(1);
  }

  if (!raw.SPACES_CDN_URL?.trim() && !raw.SPACES_PUBLIC_URL?.trim()) {
    console.error(
      "STORAGE_DRIVER=spaces requires SPACES_CDN_URL or SPACES_PUBLIC_URL."
    );
    process.exit(1);
  }
}

function normalizeHttpBaseUrl(value: string): string {
  // Remove ALL whitespace — a space after "https://" becomes "%20" in the host
  // and breaks PDF/image URLs with ERR_NAME_NOT_RESOLVED.
  return value.trim().replace(/\s+/g, "").replace(/\/+$/, "");
}

const spacesPublicBase = normalizeHttpBaseUrl(
  raw.SPACES_CDN_URL || raw.SPACES_PUBLIC_URL || ""
);

export const env = {
  port: raw.PORT,
  nodeEnv: raw.NODE_ENV,
  databaseUrl: raw.DATABASE_URL.trim(),
  jwtSecret,
  jwtExpiresIn: raw.JWT_EXPIRES_IN.trim(),
  corsOrigin,
  frontendUrl: raw.FRONTEND_URL?.trim() || "http://localhost:3000",
  apiPublicUrl: raw.API_PUBLIC_URL?.trim() || `http://localhost:${raw.PORT}`,
  isDev: raw.NODE_ENV !== "production",
  storageDriver,
  spaces: {
    endpoint: raw.SPACES_ENDPOINT?.trim() || "",
    region: raw.SPACES_REGION?.trim() || "",
    bucket: raw.SPACES_BUCKET?.trim() || "",
    key: raw.SPACES_KEY?.trim() || "",
    secret: raw.SPACES_SECRET?.trim() || "",
    publicBaseUrl: spacesPublicBase,
  },
};
