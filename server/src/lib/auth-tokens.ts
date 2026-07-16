import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import type { AccountType, UserRole } from "../models/enums.js";
import { toPublicStorageUrl } from "./storage.js";

export type JwtPayload = {
  sub: string;
  email: string;
  accountType: AccountType;
  role: UserRole | null;
  lguId: string | null;
  isPrimaryAdmin: boolean;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret, {
    algorithms: ["HS256"],
  });
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload;
}

/** Build a public file URL from a stored relative key (local or Spaces). */
export function toPublicFileUrl(storagePath: string | null | undefined): string {
  return toPublicStorageUrl(storagePath);
}
