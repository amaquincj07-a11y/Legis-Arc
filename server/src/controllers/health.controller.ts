import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { ok } from "../utils/api-response.js";

export const healthController = {
  async check(_req: Request, res: Response) {
    return ok(res, {
      status: "ok",
      service: "legisarc-server",
      env: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  },
};
