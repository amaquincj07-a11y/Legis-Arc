import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../utils/errors.js";
import { fail } from "../utils/api-response.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    fail(res, err.message, err.statusCode, err.details);
    return;
  }

  if (err instanceof ZodError) {
    fail(res, "Validation failed", 422, err.flatten());
    return;
  }

  console.error(err);
  fail(
    res,
    env.isDev && err instanceof Error ? err.message : "Internal server error",
    500
  );
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  fail(res, "Route not found", 404);
};

/** Validate `req.body` against a Zod schema; replaces body with parsed value. */
export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
