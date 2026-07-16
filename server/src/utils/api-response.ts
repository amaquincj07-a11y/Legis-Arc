import type { Response } from "express";

export function ok<T>(res: Response, data: T, status = 200): Response {
  const body = { success: true, data };
  return res.status(status).json(body);
}

export function fail(
  res: Response,
  error: string,
  status = 400,
  details?: unknown
): Response {
  const body = { success: false, error, details };
  return res.status(status).json(body);
}
