import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Keep secrets in the repo root `.env` (shared with Express).
const rootDir = path.join(__dirname, "..");
const clientDir = __dirname;

// Load root first, then client overrides (client/.env.local must match root JWT_SECRET).
loadEnvConfig(rootDir);
loadEnvConfig(clientDir);

const jwtSecret = (process.env.JWT_SECRET ?? "").trim();

const nextConfig: NextConfig = {
  // Required for `client/Dockerfile` (Next standalone server).
  output: "standalone",
  // Inline for Edge middleware — must match Express `env.jwtSecret`.
  env: {
    JWT_SECRET: jwtSecret,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./empty-module.js" },
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
