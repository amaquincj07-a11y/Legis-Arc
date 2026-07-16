import type { Request, RequestHandler } from "express";
import type { ProfileRow, AuthUser, CompanyAdmin } from "../models/profile.js";
import {
  mapProfileToAuthUser,
  mapProfileToCompanyAdmin,
} from "../models/index.js";
import { queryOne } from "../lib/db.js";
import { verifyAccessToken } from "../lib/auth-tokens.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";
import { asyncHandler } from "../utils/async-handler.js";

export interface AuthContext {
  accessToken: string;
  profile: ProfileRow;
  user?: AuthUser;
  companyAdmin?: CompanyAdmin;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

const PROFILE_COLUMNS = `
  id, account_type, role, lgu_id, full_name, email, position, mobile,
  is_active, is_primary_admin, module_access, allowed_categories,
  managed_password, last_login_at, created_at
`;

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

async function loadAuthContext(accessToken: string): Promise<AuthContext> {
  let payload;
  try {
    payload = verifyAccessToken(accessToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired session");
  }

  const profile = await queryOne<ProfileRow>(
    `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE id = $1`,
    [payload.sub]
  );

  if (!profile) {
    throw new UnauthorizedError("Profile not found");
  }

  if (!profile.is_active) {
    throw new ForbiddenError("This account has been deactivated");
  }

  if (profile.account_type === "company") {
    return {
      accessToken,
      profile,
      companyAdmin: mapProfileToCompanyAdmin(profile),
    };
  }

  return {
    accessToken,
    profile,
    user: mapProfileToAuthUser(profile),
  };
}

export const requireAuth: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const token = extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedError("Missing Authorization bearer token");
    }
    req.auth = await loadAuthContext(token);
    next();
  }
);

export const requireLguAuth: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const token = extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedError("Missing Authorization bearer token");
    }
    const auth = await loadAuthContext(token);
    if (auth.profile.account_type !== "lgu" || !auth.profile.lgu_id) {
      throw new ForbiddenError("LGU staff access required");
    }
    req.auth = auth;
    next();
  }
);

export const requireCompanyAuth: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const token = extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedError("Missing Authorization bearer token");
    }
    const auth = await loadAuthContext(token);
    if (auth.profile.account_type !== "company") {
      throw new ForbiddenError("Company admin access required");
    }
    req.auth = auth;
    next();
  }
);

export const requireLguPrimaryAdmin: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const token = extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedError("Missing Authorization bearer token");
    }
    const auth = await loadAuthContext(token);
    if (
      auth.profile.account_type !== "lgu" ||
      !auth.profile.lgu_id ||
      !auth.profile.is_primary_admin
    ) {
      throw new ForbiddenError("LGU primary admin access required");
    }
    req.auth = auth;
    next();
  }
);
