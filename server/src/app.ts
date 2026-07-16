import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/request-logger.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";
import routes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads");

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.corsOrigin.split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Local disk only — Spaces serves files from the CDN / public bucket URL.
  if (env.storageDriver === "local") {
    app.use("/uploads", express.static(uploadsDir));
  }

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        name: "LegisArc API",
        version: "0.2.0",
        database: "postgresql",
        docs: {
          health: "GET /api/health",
          auth: "POST /api/auth/login",
          admin: "/api/admin/*",
          public: "/api/public/:province/:municipality/*",
          company: "/api/company/*",
        },
      },
    });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
