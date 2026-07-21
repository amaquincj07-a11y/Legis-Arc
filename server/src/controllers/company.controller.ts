import type { Request, Response } from "express";
import { pool, query, queryAll, queryOne } from "../lib/db.js";
import { hashPassword } from "../lib/auth-tokens.js";
import type { LguRow } from "../models/lgu.js";
import type { ProfileRow } from "../models/profile.js";
import { ok } from "../utils/api-response.js";
import { DEFAULT_DOCUMENT_CATEGORIES } from "../lib/default-document-categories.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";

const LGU_COLUMNS = `
  id, province, municipality, status, subscription_amount,
  subscription_start_date, subscription_end_date, street_address,
  support_plan, document_count, admin_full_name, admin_position,
  admin_office_email, admin_mobile_number, created_at, updated_at
`;

const PROFILE_COLUMNS = `
  id, account_type, role, lgu_id, full_name, email, position, mobile,
  is_active, is_primary_admin, module_access, allowed_categories,
  managed_password, last_login_at, created_at
`;

const LGU_STAFF_MODULE_ACCESS = [
  "ordinances",
  "resolutions",
  "minutes",
  "categories",
] as const;

type LguWithProfiles = LguRow & { profiles: ProfileRow[] };

function toPlaceKey(value: string): string {
  return value.trim().toUpperCase();
}

async function loadLguProfiles(lguId: string): Promise<ProfileRow[]> {
  return queryAll<ProfileRow>(
    `SELECT ${PROFILE_COLUMNS}
     FROM profiles
     WHERE lgu_id = $1 AND account_type = 'lgu'
     ORDER BY is_primary_admin DESC, full_name ASC`,
    [lguId]
  );
}

async function loadLguWithProfiles(lguId: string): Promise<LguWithProfiles | null> {
  const row = await queryOne<LguRow>(
    `SELECT ${LGU_COLUMNS} FROM lgus WHERE id = $1`,
    [lguId]
  );
  if (!row) return null;
  const profiles = await loadLguProfiles(lguId);
  return { ...row, profiles };
}

type CreateLguBody = {
  province?: string;
  municipality?: string;
  administrator?: {
    fullName?: string;
    position?: string;
    officeEmail?: string;
    mobileNumber?: string;
    password?: string;
  };
};

type UpdateLguBody = {
  administrator?: {
    fullName?: string;
    position?: string;
    officeEmail?: string;
    mobileNumber?: string;
  };
  password?: string;
};

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
  position?: string;
};

type ToggleActiveBody = {
  isActive?: boolean;
};

export const companyController = {
  async listLgus(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const rows = await queryAll<LguRow>(
      `SELECT ${LGU_COLUMNS} FROM lgus ORDER BY municipality ASC`
    );

    // Attach primary admin profiles so managed passwords are available when needed
    const withProfiles: LguWithProfiles[] = [];
    for (const row of rows) {
      const profiles = await loadLguProfiles(row.id);
      withProfiles.push({ ...row, profiles });
    }
    return ok(res, withProfiles);
  },

  async getLgu(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const row = await loadLguWithProfiles(String(req.params.id));
    if (!row) throw new NotFoundError("LGU not found");
    return ok(res, row);
  },

  async createLgu(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const body = req.body as CreateLguBody;
    const province = toPlaceKey(body.province ?? "");
    const municipality = toPlaceKey(body.municipality ?? "");
    const admin = body.administrator ?? {};

    const fullName = (admin.fullName ?? "").trim();
    const position = (admin.position ?? "").trim();
    const officeEmail = (admin.officeEmail ?? "").trim().toLowerCase();
    const mobileNumber = (admin.mobileNumber ?? "").trim();
    const password = admin.password ?? "";

    if (!province || !municipality) {
      throw new AppError("Province and municipality are required.", 400);
    }
    if (!fullName || !position || !officeEmail || !mobileNumber) {
      throw new AppError("Administrator details are incomplete.", 400);
    }
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const existingLgu = await client.query(
        `SELECT id FROM lgus WHERE province = $1 AND municipality = $2 LIMIT 1`,
        [province, municipality]
      );
      if (existingLgu.rowCount && existingLgu.rowCount > 0) {
        throw new ConflictError(
          "An LGU account already exists for this municipality."
        );
      }

      const existingEmail = await client.query(
        `SELECT id FROM profiles WHERE lower(email) = lower($1) LIMIT 1`,
        [officeEmail]
      );
      if (existingEmail.rowCount && existingEmail.rowCount > 0) {
        throw new ConflictError(
          "An account with this office email already exists."
        );
      }

      const lguInsert = await client.query<LguRow>(
        `INSERT INTO lgus (
          province, municipality, status, subscription_amount,
          subscription_end_date, support_plan,
          document_count, admin_full_name, admin_position,
          admin_office_email, admin_mobile_number
        ) VALUES (
          $1, $2, 'pending', 60000,
          now() + interval '14 days', 'annual',
          0, $3, $4, $5, $6
        )
        RETURNING ${LGU_COLUMNS}`,
        [province, municipality, fullName, position, officeEmail, mobileNumber]
      );

      const lgu = lguInsert.rows[0];
      if (!lgu) {
        throw new AppError("Failed to create LGU record.", 500);
      }

      const passwordHash = await hashPassword(password);

      const profileInsert = await client.query<ProfileRow>(
        `INSERT INTO profiles (
          email, password_hash, account_type, role, lgu_id,
          full_name, position, mobile, is_active, is_primary_admin,
          module_access, managed_password
        ) VALUES (
          $1, $2, 'lgu', 'sb_secretary', $3,
          $4, $5, $6, true, true,
          $7::text[], $8
        )
        RETURNING ${PROFILE_COLUMNS}`,
        [
          officeEmail,
          passwordHash,
          lgu.id,
          fullName,
          position,
          mobileNumber,
          [...LGU_STAFF_MODULE_ACCESS],
          password,
        ]
      );

      const createdProfile = profileInsert.rows[0];
      if (!createdProfile) {
        throw new AppError("Failed to create administrator login.", 500);
      }

      // Ensure company-admin password reveal value is persisted (plain text reference).
      if (
        typeof createdProfile.managed_password !== "string" ||
        createdProfile.managed_password.length === 0
      ) {
        await client.query(
          `UPDATE profiles SET managed_password = $2 WHERE id = $1`,
          [createdProfile.id, password]
        );
        createdProfile.managed_password = password;
      }

      for (let i = 0; i < DEFAULT_DOCUMENT_CATEGORIES.length; i++) {
        await client.query(
          `INSERT INTO document_categories (lgu_id, name, is_active, sort_order)
           VALUES ($1, $2, true, $3)
           ON CONFLICT (lgu_id, name) DO NOTHING`,
          [lgu.id, DEFAULT_DOCUMENT_CATEGORIES[i], i]
        );
      }

      await client.query("COMMIT");
      return ok(
        res,
        { ...lgu, profiles: [createdProfile] },
        201
      );
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof AppError) throw error;

      const pgError = error as { code?: string; constraint?: string };
      if (pgError.code === "23505") {
        if (pgError.constraint === "lgus_province_municipality_unique") {
          throw new ConflictError(
            "An LGU account already exists for this municipality."
          );
        }
        throw new ConflictError("A conflicting record already exists.");
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async updateLgu(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const lguId = String(req.params.id);
    const body = req.body as UpdateLguBody;
    const admin = body.administrator ?? {};
    const fullName = (admin.fullName ?? "").trim();
    const position = (admin.position ?? "").trim();
    const officeEmail = (admin.officeEmail ?? "").trim().toLowerCase();
    const mobileNumber = (admin.mobileNumber ?? "").trim();
    const password = body.password?.trim() ?? "";

    if (!fullName || !position || !officeEmail || !mobileNumber) {
      throw new AppError("Administrator details are incomplete.", 400);
    }
    if (password && password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const existing = await client.query(
        `SELECT id FROM lgus WHERE id = $1 LIMIT 1`,
        [lguId]
      );
      if (!existing.rowCount) {
        throw new NotFoundError("LGU not found");
      }

      await client.query(
        `UPDATE lgus SET
          admin_full_name = $2,
          admin_position = $3,
          admin_office_email = $4,
          admin_mobile_number = $5
         WHERE id = $1`,
        [lguId, fullName, position, officeEmail, mobileNumber]
      );

      const primary = await client.query<{ id: string }>(
        `SELECT id FROM profiles
         WHERE lgu_id = $1 AND account_type = 'lgu' AND is_primary_admin = true
         ORDER BY created_at ASC
         LIMIT 1`,
        [lguId]
      );
      const primaryId = primary.rows[0]?.id;

      if (primaryId) {
        if (password) {
          const passwordHash = await hashPassword(password);
          await client.query(
            `UPDATE profiles SET
              full_name = $2,
              email = $3,
              position = $4,
              mobile = $5,
              password_hash = $6,
              managed_password = $7
             WHERE id = $1`,
            [
              primaryId,
              fullName,
              officeEmail,
              position,
              mobileNumber,
              passwordHash,
              password,
            ]
          );
        } else {
          await client.query(
            `UPDATE profiles SET
              full_name = $2,
              email = $3,
              position = $4,
              mobile = $5
             WHERE id = $1`,
            [primaryId, fullName, officeEmail, position, mobileNumber]
          );
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof AppError) throw error;
      const pgError = error as { code?: string };
      if (pgError.code === "23505") {
        throw new ConflictError(
          "An account with this office email already exists."
        );
      }
      throw error;
    } finally {
      client.release();
    }

    const updated = await loadLguWithProfiles(lguId);
    if (!updated) throw new NotFoundError("LGU not found");
    return ok(res, updated);
  },

  async updateSubscription(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const lguId = String(req.params.id);
    const body = req.body as {
      status?: string;
      subscriptionStartDate?: string;
      subscriptionEndDate?: string;
      recordPeriod?: boolean;
    };

    const existing = await queryOne<LguRow>(
      `SELECT ${LGU_COLUMNS} FROM lgus WHERE id = $1`,
      [lguId]
    );
    if (!existing) throw new NotFoundError("LGU not found");

    const statusRaw = body.status?.trim();
    const status =
      statusRaw === "trial" ? "pending" : statusRaw === "paid" ? "active" : statusRaw;

    const start = body.subscriptionStartDate
      ? new Date(body.subscriptionStartDate)
      : null;
    const end = body.subscriptionEndDate
      ? new Date(body.subscriptionEndDate)
      : null;

    await query(
      `UPDATE lgus SET
        status = COALESCE($2::lgu_status, status),
        subscription_start_date = COALESCE($3::timestamptz, subscription_start_date),
        subscription_end_date = COALESCE($4::timestamptz, subscription_end_date)
       WHERE id = $1`,
      [
        lguId,
        status || null,
        start && !Number.isNaN(start.getTime()) ? start.toISOString() : null,
        end && !Number.isNaN(end.getTime()) ? end.toISOString() : null,
      ]
    );

    if (body.recordPeriod && start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      await query(
        `INSERT INTO lgu_subscription_periods (lgu_id, amount, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [lguId, existing.subscription_amount, start.toISOString(), end.toISOString()]
      );
    }

    const updated = await loadLguWithProfiles(lguId);
    if (!updated) throw new NotFoundError("LGU not found");
    return ok(res, updated);
  },

  async activate(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();
    const lguId = String(req.params.id);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    req.body = {
      status: "active",
      subscriptionStartDate: start.toISOString(),
      subscriptionEndDate: end.toISOString(),
      recordPeriod: true,
    };
    req.params.id = lguId;
    return companyController.updateSubscription(req, res);
  },

  async block(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();
    req.body = { status: "suspended" };
    return companyController.updateSubscription(req, res);
  },

  async unblock(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();
    const lguId = String(req.params.id);
    const existing = await queryOne<LguRow>(
      `SELECT ${LGU_COLUMNS} FROM lgus WHERE id = $1`,
      [lguId]
    );
    if (!existing) throw new NotFoundError("LGU not found");

    const hasPeriod =
      existing.subscription_start_date != null &&
      existing.subscription_end_date != null;
    const expired =
      hasPeriod &&
      new Date(existing.subscription_end_date!) < new Date();

    let status: string = "pending";
    if (hasPeriod && !expired) status = "active";
    else if (expired) status = "expired";

    req.body = { status };
    return companyController.updateSubscription(req, res);
  },

  async listUsers(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const lguId = String(req.params.id);
    const lgu = await queryOne(`SELECT id FROM lgus WHERE id = $1`, [lguId]);
    if (!lgu) throw new NotFoundError("LGU not found");

    const profiles = await loadLguProfiles(lguId);
    return ok(res, profiles);
  },

  async createUser(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const lguId = String(req.params.id);
    const body = req.body as CreateUserBody;
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const position = (body.position ?? "").trim() || "LGU Staff";

    if (!name) throw new AppError("Name is required.", 400);
    if (!email) throw new AppError("Email is required.", 400);
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    const lgu = await queryOne(`SELECT id FROM lgus WHERE id = $1`, [lguId]);
    if (!lgu) throw new NotFoundError("LGU not found");

    const existingEmail = await queryOne(
      `SELECT id FROM profiles WHERE lower(email) = lower($1)`,
      [email]
    );
    if (existingEmail) {
      throw new ConflictError("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(password);
    const profile = await queryOne<ProfileRow>(
      `INSERT INTO profiles (
        email, password_hash, account_type, role, lgu_id,
        full_name, position, mobile, is_active, is_primary_admin,
        module_access, managed_password
      ) VALUES (
        $1, $2, 'lgu', 'sb_secretary', $3,
        $4, $5, NULL, true, false,
        $6::text[], $7
      )
      RETURNING ${PROFILE_COLUMNS}`,
      [
        email,
        passwordHash,
        lguId,
        name,
        position,
        [...LGU_STAFF_MODULE_ACCESS],
        password,
      ]
    );

    if (!profile) throw new AppError("Failed to create user profile.", 500);
    return ok(res, profile, 201);
  },

  async toggleUserActive(req: Request, res: Response) {
    if (!req.auth) throw new UnauthorizedError();

    const lguId = String(req.params.id);
    const userId = String(req.params.userId);
    const body = req.body as ToggleActiveBody;
    const isActive = Boolean(body.isActive);

    const existing = await queryOne<ProfileRow>(
      `SELECT ${PROFILE_COLUMNS}
       FROM profiles
       WHERE id = $1 AND lgu_id = $2 AND account_type = 'lgu'`,
      [userId, lguId]
    );
    if (!existing) throw new NotFoundError("User not found for this LGU.");

    if (existing.is_primary_admin) {
      throw new AppError(
        "The primary administrator account cannot be deactivated here.",
        400
      );
    }

    const updated = await queryOne<ProfileRow>(
      `UPDATE profiles SET is_active = $2
       WHERE id = $1
       RETURNING ${PROFILE_COLUMNS}`,
      [userId, isActive]
    );
    if (!updated) throw new NotFoundError("User not found for this LGU.");
    return ok(res, updated);
  },
};
