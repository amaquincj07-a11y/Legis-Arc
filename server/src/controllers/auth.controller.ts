import type { Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { query, queryOne } from "../lib/db.js";
import {
  hashPassword,
  signAccessToken,
  verifyPassword,
} from "../lib/auth-tokens.js";
import { env } from "../config/env.js";
import type { ProfileRow } from "../models/profile.js";
import {
  mapProfileToAuthUser,
  mapProfileToCompanyAdmin,
} from "../models/index.js";
import type { LguRow } from "../models/lgu.js";
import { ok } from "../utils/api-response.js";
import { AppError, UnauthorizedError } from "../utils/errors.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const PROFILE_COLUMNS = `
  id, account_type, role, lgu_id, full_name, email, position, mobile,
  is_active, is_primary_admin, module_access, allowed_categories,
  managed_password, last_login_at, created_at, password_hash
`;

type ProfileWithPassword = ProfileRow & { password_hash: string };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const profile = await queryOne<ProfileWithPassword>(
      `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE lower(email) = $1`,
      [normalizedEmail]
    );

    if (!profile) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await verifyPassword(password, profile.password_hash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!profile.is_active) {
      throw new AppError("This account has been deactivated", 403);
    }

    if (profile.account_type === "lgu" && profile.lgu_id) {
      const lgu = await queryOne<Pick<LguRow, "status">>(
        `SELECT status FROM lgus WHERE id = $1`,
        [profile.lgu_id]
      );
      if (lgu?.status === "suspended") {
        throw new AppError("This LGU account is suspended", 403);
      }
    }

    void query(`UPDATE profiles SET last_login_at = now() WHERE id = $1`, [
      profile.id,
    ]);

    const accessToken = signAccessToken({
      sub: profile.id,
      email: profile.email,
      accountType: profile.account_type,
      role: profile.role,
      lguId: profile.lgu_id,
      isPrimaryAdmin: profile.is_primary_admin,
    });

    if (profile.account_type === "company") {
      return ok(res, {
        portal: "company",
        redirectTo: "/super-admin/dashboard",
        accessToken,
        refreshToken: accessToken,
        companyAdmin: mapProfileToCompanyAdmin(profile),
      });
    }

    return ok(res, {
      portal: "lgu",
      redirectTo: "/admin/dashboard",
      accessToken,
      refreshToken: accessToken,
      user: mapProfileToAuthUser(profile),
    });
  },

  async me(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth) throw new UnauthorizedError();

    if (auth.profile.account_type === "company") {
      return ok(res, {
        portal: "company",
        companyAdmin: auth.companyAdmin,
        profile: auth.profile,
      });
    }

    return ok(res, {
      portal: "lgu",
      user: auth.user,
      profile: auth.profile,
    });
  },

  async logout(_req: Request, res: Response) {
    return ok(res, { signedOut: true });
  },

  async requestPasswordReset(req: Request, res: Response) {
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const redirectTo = String(req.body?.redirectTo ?? "").trim();

    const generic = {
      message:
        "If that email matches an LGU main admin account, a reset link has been sent. Check your inbox and spam folder.",
    };

    if (!email.includes("@")) {
      throw new AppError("Enter a valid email address.", 400);
    }

    const profile = await queryOne<ProfileRow>(
      `SELECT id, account_type, is_active, is_primary_admin, email
       FROM profiles WHERE lower(email) = $1`,
      [email]
    );

    const eligible =
      profile &&
      profile.account_type === "lgu" &&
      profile.is_active &&
      profile.is_primary_admin;

    if (eligible) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await query(
        `UPDATE profiles SET
          password_reset_token_hash = $2,
          password_reset_expires_at = $3
         WHERE id = $1`,
        [profile.id, tokenHash, expires.toISOString()]
      );

      const base =
        redirectTo.startsWith("http://") || redirectTo.startsWith("https://")
          ? redirectTo.split("?")[0]
          : `${env.frontendUrl}/login/reset-password`;
      const link = `${base}?token=${token}`;

      if (env.isDev) {
        console.log(`[password-reset] ${email} → ${link}`);
      }
    }

    return ok(res, generic);
  },

  async completePasswordReset(req: Request, res: Response) {
    const token = String(req.body?.token ?? "").trim();
    const password = String(req.body?.password ?? "");

    if (!token) throw new AppError("Reset token is required.", 400);
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    const tokenHash = hashToken(token);
    const profile = await queryOne<ProfileRow>(
      `SELECT id, email FROM profiles
       WHERE password_reset_token_hash = $1
         AND password_reset_expires_at IS NOT NULL
         AND password_reset_expires_at > now()`,
      [tokenHash]
    );

    if (!profile) {
      throw new AppError("Invalid or expired reset link.", 400);
    }

    const passwordHash = await hashPassword(password);
    await query(
      `UPDATE profiles SET
        password_hash = $2,
        managed_password = $3,
        password_reset_token_hash = NULL,
        password_reset_expires_at = NULL
       WHERE id = $1`,
      [profile.id, passwordHash, password]
    );

    return ok(res, { message: "Password updated. You can sign in now." });
  },
};
