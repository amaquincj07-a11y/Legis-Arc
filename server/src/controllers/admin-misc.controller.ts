import type { Request, Response } from "express";
import { query, queryAll, queryOne } from "../lib/db.js";
import type { ActivityLogRow, DownloadLogRow } from "../models/activity.js";
import type { SbMemberRow } from "../models/sb-member.js";
import type { CommitteeRow } from "../models/committee.js";
import type { CsoRow } from "../models/cso.js";
import { ok } from "../utils/api-response.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import type { AuthContext } from "../middleware/auth.js";
import {
  deleteUploadedFile,
  relativePathFromFile,
} from "../lib/upload.js";
import { toPublicFileUrl, hashPassword } from "../lib/auth-tokens.js";
import { recordActivity } from "../lib/activity.js";

function requireLgu(req: Request): AuthContext {
  const auth = req.auth;
  if (!auth?.profile.lgu_id) {
    throw new UnauthorizedError();
  }
  return auth;
}

export const dashboardController = {
  async stats(req: Request, res: Response) {
    const auth = requireLgu(req);
    const lguId = auth.profile.lgu_id!;

    const [ordinances, resolutions, minutes, categories] = await Promise.all([
      queryOne<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM ordinances WHERE lgu_id = $1`,
        [lguId]
      ),
      queryOne<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM resolutions WHERE lgu_id = $1`,
        [lguId]
      ),
      queryOne<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM session_minutes WHERE lgu_id = $1`,
        [lguId]
      ),
      queryAll<{ name: string }>(
        `SELECT name FROM document_categories
         WHERE lgu_id = $1 AND is_active = true
         ORDER BY sort_order ASC`,
        [lguId]
      ),
    ]);

    const ordinanceCount = Number(ordinances?.count ?? 0);
    const resolutionCount = Number(resolutions?.count ?? 0);
    const minutesCount = Number(minutes?.count ?? 0);
    const categoryNames = categories.map((row) => row.name);

    let categoryBreakdown: { name: string; count: number }[] = [];

    if (categoryNames.length > 0) {
      const countResults = await Promise.all(
        categoryNames.map((name) =>
          queryOne<{ count: string }>(
            `SELECT COUNT(*)::text AS count
             FROM ordinances
             WHERE lgu_id = $1 AND category = $2`,
            [lguId, name]
          )
        )
      );

      categoryBreakdown = categoryNames
        .map((name, index) => ({
          name,
          count: Number(countResults[index]?.count ?? 0),
        }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }

    return ok(res, {
      ordinanceCount,
      resolutionCount,
      minutesCount,
      totalDocuments: ordinanceCount + resolutionCount + minutesCount,
      categoryBreakdown,
    });
  },
};

export const activityController = {
  async list(req: Request, res: Response) {
    const auth = requireLgu(req);
    const rows = await queryAll<ActivityLogRow>(
      `SELECT id, lgu_id, user_id, user_name, action, module,
              entity_id, entity_title, details, created_at
       FROM lgu_activity_logs
       WHERE lgu_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [auth.profile.lgu_id]
    );
    return ok(res, rows);
  },
};

export const downloadLogsController = {
  async list(req: Request, res: Response) {
    const auth = requireLgu(req);
    const rows = await queryAll<DownloadLogRow>(
      `SELECT id, lgu_id, document_id, document_type, document_number,
              document_title, document_category, requester_name, office_org,
              purpose, consent_agreed, created_at
       FROM document_download_logs
       WHERE lgu_id = $1
       ORDER BY created_at DESC
       LIMIT 200`,
      [auth.profile.lgu_id]
    );
    return ok(res, rows);
  },
};

export const sbMembersController = {
  async list(req: Request, res: Response) {
    const auth = requireLgu(req);
    const rows = await queryAll<SbMemberRow>(
      `SELECT id, lgu_id, name, position_slot, position, image_storage_path,
              committees, created_by, created_at, updated_at
       FROM sb_members
       WHERE lgu_id = $1
       ORDER BY name ASC`,
      [auth.profile.lgu_id]
    );

    const withUrls = rows.map((r) => ({
      ...r,
      imageUrl: toPublicFileUrl(r.image_storage_path),
    }));

    return ok(res, withUrls);
  },

  async create(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { name, positionSlot, position, committees } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Name is required", 400);
    }

    let committeesArray: string[] = [];
    if (committees) {
      if (typeof committees === "string") {
        try {
          committeesArray = JSON.parse(committees);
        } catch {
          committeesArray = [committees];
        }
      } else if (Array.isArray(committees)) {
        committeesArray = committees;
      }
    }

    let imageStoragePath: string | null = null;
    if (req.file) {
      imageStoragePath = relativePathFromFile(
        auth.profile.lgu_id!,
        "sb-members",
        req.file
      );
    }

    let row: SbMemberRow | null;
    try {
      row = await queryOne<SbMemberRow>(
        `INSERT INTO sb_members (lgu_id, name, position_slot, position, image_storage_path, committees, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, lgu_id, name, position_slot, position, image_storage_path, committees, created_by, created_at, updated_at`,
        [
          auth.profile.lgu_id,
          name.trim(),
          positionSlot || null,
          position || null,
          imageStoragePath,
          committeesArray,
          auth.profile.id,
        ]
      );
    } catch (error) {
      if (imageStoragePath) {
        await deleteUploadedFile(imageStoragePath);
      }
      throw error;
    }

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "upload",
      module: "sb-members",
      entityId: row!.id,
      entityTitle: row!.name,
      details: `Created SB member: ${row!.name}`,
    });

    return ok(res, {
      ...row,
      imageUrl: toPublicFileUrl(row!.image_storage_path),
    });
  },

  async update(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;
    const { name, positionSlot, position, committees } = req.body;

    const existing = await queryOne<SbMemberRow>(
      `SELECT id, image_storage_path FROM sb_members WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("SB member not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined && typeof name === "string" && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (positionSlot !== undefined) {
      updates.push(`position_slot = $${paramIndex++}`);
      values.push(positionSlot || null);
    }

    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(position || null);
    }

    if (committees !== undefined) {
      let committeesArray: string[] = [];
      if (typeof committees === "string") {
        try {
          committeesArray = JSON.parse(committees);
        } catch {
          committeesArray = [committees];
        }
      } else if (Array.isArray(committees)) {
        committeesArray = committees;
      }
      updates.push(`committees = $${paramIndex++}`);
      values.push(committeesArray);
    }

    if (req.file) {
      const newImagePath = relativePathFromFile(
        auth.profile.lgu_id!,
        "sb-members",
        req.file
      );
      updates.push(`image_storage_path = $${paramIndex++}`);
      values.push(newImagePath);

      if (existing.image_storage_path) {
        await deleteUploadedFile(existing.image_storage_path);
      }
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    values.push(id, auth.profile.lgu_id);

    const row = await queryOne<SbMemberRow>(
      `UPDATE sb_members
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex++} AND lgu_id = $${paramIndex++}
       RETURNING id, lgu_id, name, position_slot, position, image_storage_path, committees, created_by, created_at, updated_at`,
      values
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "edit",
      module: "sb-members",
      entityId: row!.id,
      entityTitle: row!.name,
      details: `Updated SB member: ${row!.name}`,
    });

    return ok(res, {
      ...row,
      imageUrl: toPublicFileUrl(row!.image_storage_path),
    });
  },

  async remove(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;

    const existing = await queryOne<SbMemberRow>(
      `SELECT id, name, image_storage_path FROM sb_members WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("SB member not found");
    }

    await query(`DELETE FROM sb_members WHERE id = $1 AND lgu_id = $2`, [
      id,
      auth.profile.lgu_id,
    ]);

    if (existing.image_storage_path) {
      await deleteUploadedFile(existing.image_storage_path);
    }

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "delete",
      module: "sb-members",
      entityId: existing.id,
      entityTitle: existing.name,
      details: `Deleted SB member: ${existing.name}`,
    });

    return ok(res, { success: true });
  },
};

export const committeesController = {
  async list(req: Request, res: Response) {
    const auth = requireLgu(req);
    const rows = await queryAll<CommitteeRow>(
      `SELECT id, lgu_id, name, chairman_id, vice_chairman_id, member_ids,
              created_by, created_at, updated_at
       FROM committees
       WHERE lgu_id = $1
       ORDER BY name ASC`,
      [auth.profile.lgu_id]
    );
    return ok(res, rows);
  },

  async create(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { name, chairmanId, viceChairmanId, memberIds } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Committee name is required", 400);
    }

    let memberIdsArray: string[] = [];
    if (memberIds) {
      if (typeof memberIds === "string") {
        try {
          memberIdsArray = JSON.parse(memberIds);
        } catch {
          memberIdsArray = [memberIds];
        }
      } else if (Array.isArray(memberIds)) {
        memberIdsArray = memberIds;
      }
    }

    const row = await queryOne<CommitteeRow>(
      `INSERT INTO committees (lgu_id, name, chairman_id, vice_chairman_id, member_ids, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, lgu_id, name, chairman_id, vice_chairman_id, member_ids, created_by, created_at, updated_at`,
      [
        auth.profile.lgu_id,
        name.trim(),
        chairmanId || null,
        viceChairmanId || null,
        memberIdsArray,
        auth.profile.id,
      ]
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "upload",
      module: "committees",
      entityId: row!.id,
      entityTitle: row!.name,
      details: `Created committee: ${row!.name}`,
    });

    return ok(res, row);
  },

  async update(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;
    const { name, chairmanId, viceChairmanId, memberIds } = req.body;

    const existing = await queryOne<CommitteeRow>(
      `SELECT id FROM committees WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("Committee not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined && typeof name === "string" && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (chairmanId !== undefined) {
      updates.push(`chairman_id = $${paramIndex++}`);
      values.push(chairmanId || null);
    }

    if (viceChairmanId !== undefined) {
      updates.push(`vice_chairman_id = $${paramIndex++}`);
      values.push(viceChairmanId || null);
    }

    if (memberIds !== undefined) {
      let memberIdsArray: string[] = [];
      if (typeof memberIds === "string") {
        try {
          memberIdsArray = JSON.parse(memberIds);
        } catch {
          memberIdsArray = [memberIds];
        }
      } else if (Array.isArray(memberIds)) {
        memberIdsArray = memberIds;
      }
      updates.push(`member_ids = $${paramIndex++}`);
      values.push(memberIdsArray);
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    values.push(id, auth.profile.lgu_id);

    const row = await queryOne<CommitteeRow>(
      `UPDATE committees
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex++} AND lgu_id = $${paramIndex++}
       RETURNING id, lgu_id, name, chairman_id, vice_chairman_id, member_ids, created_by, created_at, updated_at`,
      values
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "edit",
      module: "committees",
      entityId: row!.id,
      entityTitle: row!.name,
      details: `Updated committee: ${row!.name}`,
    });

    return ok(res, row);
  },

  async remove(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;

    const existing = await queryOne<CommitteeRow>(
      `SELECT id, name FROM committees WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("Committee not found");
    }

    await query(`DELETE FROM committees WHERE id = $1 AND lgu_id = $2`, [
      id,
      auth.profile.lgu_id,
    ]);

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "delete",
      module: "committees",
      entityId: existing.id,
      entityTitle: existing.name,
      details: `Deleted committee: ${existing.name}`,
    });

    return ok(res, { success: true });
  },
};

export const csoController = {
  async list(req: Request, res: Response) {
    const auth = requireLgu(req);
    const rows = await queryAll<CsoRow>(
      `SELECT id, lgu_id, name, officer_name, position, term,
              created_by, created_at, updated_at
       FROM cso_organizations
       WHERE lgu_id = $1
       ORDER BY name ASC`,
      [auth.profile.lgu_id]
    );
    return ok(res, rows);
  },

  async create(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { name, officerName, position, term } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("CSO name is required", 400);
    }

    const row = await queryOne<CsoRow>(
      `INSERT INTO cso_organizations (lgu_id, name, officer_name, position, term, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, lgu_id, name, officer_name, position, term, created_by, created_at, updated_at`,
      [
        auth.profile.lgu_id,
        name.trim(),
        officerName || null,
        position || null,
        term || null,
        auth.profile.id,
      ]
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "upload",
      module: "cso",
      entityId: row!.id,
      entityTitle: row!.name,
      details: `Created CSO: ${row!.name}`,
    });

    return ok(res, row);
  },

  async update(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;
    const { name, officerName, position, term } = req.body;

    const existing = await queryOne<CsoRow>(
      `SELECT id FROM cso_organizations WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("CSO not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined && typeof name === "string" && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (officerName !== undefined) {
      updates.push(`officer_name = $${paramIndex++}`);
      values.push(officerName || null);
    }

    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(position || null);
    }

    if (term !== undefined) {
      updates.push(`term = $${paramIndex++}`);
      values.push(term || null);
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    values.push(id, auth.profile.lgu_id);

    const row = await queryOne<CsoRow>(
      `UPDATE cso_organizations
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex++} AND lgu_id = $${paramIndex++}
       RETURNING id, lgu_id, name, officer_name, position, term, created_by, created_at, updated_at`,
      values
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "edit",
      module: "cso",
      entityId: row!.id,
      entityTitle: row!.name,
      details: `Updated CSO: ${row!.name}`,
    });

    return ok(res, row);
  },

  async remove(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;

    const existing = await queryOne<CsoRow>(
      `SELECT id, name FROM cso_organizations WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("CSO not found");
    }

    await query(
      `DELETE FROM cso_organizations WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "delete",
      module: "cso",
      entityId: existing.id,
      entityTitle: existing.name,
      details: `Deleted CSO: ${existing.name}`,
    });

    return ok(res, { success: true });
  },
};

export const usersController = {
  async list(req: Request, res: Response) {
    const auth = requireLgu(req);
    
    interface ProfileRow {
      id: string;
      email: string;
      full_name: string;
      position: string | null;
      role: string | null;
      is_active: boolean;
      is_primary_admin: boolean;
      module_access: string[];
      managed_password: string | null;
      last_login_at: string | null;
      created_at: string;
    }

    const rows = await queryAll<ProfileRow>(
      `SELECT id, email, full_name, position, role, is_active, is_primary_admin,
              module_access, managed_password, last_login_at, created_at
       FROM profiles
       WHERE lgu_id = $1 AND account_type = 'lgu'
       ORDER BY full_name ASC`,
      [auth.profile.lgu_id]
    );

    return ok(res, rows);
  },

  async create(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { name, email, password, position, moduleAccess } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Name is required", 400);
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      throw new AppError("Email is required", 400);
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      throw new AppError("Password is required", 400);
    }

    const emailLower = email.trim().toLowerCase();

    const existingUser = await queryOne<{ id: string }>(
      `SELECT id FROM profiles WHERE lower(email) = $1`,
      [emailLower]
    );

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    const passwordHash = await hashPassword(password);

    let moduleAccessArray: string[] = [];
    if (moduleAccess) {
      if (typeof moduleAccess === "string") {
        try {
          moduleAccessArray = JSON.parse(moduleAccess);
        } catch {
          moduleAccessArray = [moduleAccess];
        }
      } else if (Array.isArray(moduleAccess)) {
        moduleAccessArray = moduleAccess;
      }
    }

    interface NewUserRow {
      id: string;
      email: string;
      full_name: string;
      position: string | null;
      role: string;
      is_active: boolean;
      is_primary_admin: boolean;
      module_access: string[];
      managed_password: string;
      created_at: string;
    }

    const row = await queryOne<NewUserRow>(
      `INSERT INTO profiles (
        email, password_hash, account_type, role, lgu_id, full_name, position,
        is_active, is_primary_admin, module_access, managed_password
      )
      VALUES ($1, $2, 'lgu', 'sb_secretary', $3, $4, $5, true, false, $6, $7)
      RETURNING id, email, full_name, position, role, is_active, is_primary_admin,
                module_access, managed_password, created_at`,
      [
        emailLower,
        passwordHash,
        auth.profile.lgu_id,
        name.trim(),
        position || null,
        moduleAccessArray,
        password,
      ]
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "upload",
      module: "users",
      entityId: row!.id,
      entityTitle: row!.email,
      details: `Created user: ${row!.full_name} (${row!.email})`,
    });

    return ok(res, row);
  },

  async update(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;
    const { name, email, position, password, moduleAccess } = req.body;

    interface ExistingUserRow {
      id: string;
      email: string;
    }

    const existing = await queryOne<ExistingUserRow>(
      `SELECT id, email FROM profiles WHERE id = $1 AND lgu_id = $2 AND account_type = 'lgu'`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("User not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined && typeof name === "string" && name.trim()) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (email !== undefined && typeof email === "string" && email.trim()) {
      const emailLower = email.trim().toLowerCase();
      
      if (emailLower !== existing.email.toLowerCase()) {
        const emailExists = await queryOne<{ id: string }>(
          `SELECT id FROM profiles WHERE lower(email) = $1 AND id != $2`,
          [emailLower, id]
        );
        
        if (emailExists) {
          throw new ConflictError("Email already exists");
        }
      }

      updates.push(`email = $${paramIndex++}`);
      values.push(emailLower);
    }

    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(position || null);
    }

    if (password !== undefined && typeof password === "string" && password.trim()) {
      const passwordHash = await hashPassword(password);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
      updates.push(`managed_password = $${paramIndex++}`);
      values.push(password);
    }

    if (moduleAccess !== undefined) {
      let moduleAccessArray: string[] = [];
      if (typeof moduleAccess === "string") {
        try {
          moduleAccessArray = JSON.parse(moduleAccess);
        } catch {
          moduleAccessArray = [moduleAccess];
        }
      } else if (Array.isArray(moduleAccess)) {
        moduleAccessArray = moduleAccess;
      }
      updates.push(`module_access = $${paramIndex++}`);
      values.push(moduleAccessArray);
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    values.push(id, auth.profile.lgu_id);

    interface UpdatedUserRow {
      id: string;
      email: string;
      full_name: string;
      position: string | null;
      role: string;
      is_active: boolean;
      is_primary_admin: boolean;
      module_access: string[];
      managed_password: string | null;
    }

    const row = await queryOne<UpdatedUserRow>(
      `UPDATE profiles
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex++} AND lgu_id = $${paramIndex++}
       RETURNING id, email, full_name, position, role, is_active, is_primary_admin,
                 module_access, managed_password`,
      values
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "edit",
      module: "users",
      entityId: row!.id,
      entityTitle: row!.email,
      details: `Updated user: ${row!.full_name} (${row!.email})`,
    });

    return ok(res, row);
  },

  async toggleActive(req: Request, res: Response) {
    const auth = requireLgu(req);
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new AppError("isActive must be a boolean", 400);
    }

    interface UserToToggle {
      id: string;
      is_primary_admin: boolean;
      full_name: string;
      email: string;
    }

    const existing = await queryOne<UserToToggle>(
      `SELECT id, is_primary_admin, full_name, email
       FROM profiles
       WHERE id = $1 AND lgu_id = $2 AND account_type = 'lgu'`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("User not found");
    }

    if (existing.is_primary_admin && !isActive) {
      throw new AppError("Cannot deactivate primary admin", 400);
    }

    await query(
      `UPDATE profiles SET is_active = $1 WHERE id = $2 AND lgu_id = $3`,
      [isActive, id, auth.profile.lgu_id]
    );

    await recordActivity({
      lguId: auth.profile.lgu_id!,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "edit",
      module: "users",
      entityId: existing.id,
      entityTitle: existing.email,
      details: `${isActive ? "Activated" : "Deactivated"} user: ${existing.full_name} (${existing.email})`,
    });

    return ok(res, { success: true, isActive });
  },
};

export const accountController = {
  async get(req: Request, res: Response) {
    const auth = requireLgu(req);

    interface ProfileData {
      id: string;
      email: string;
      full_name: string;
      position: string | null;
      mobile: string | null;
      role: string | null;
      is_primary_admin: boolean;
      module_access: string[];
      managed_password: string | null;
    }

    interface LguData {
      id: string;
      province: string;
      municipality: string;
      street_address: string | null;
      status: string;
      support_plan: string | null;
      subscription_amount: string;
      subscription_start_date: string;
      subscription_end_date: string;
      document_count: number;
      admin_full_name: string;
      admin_position: string;
      admin_office_email: string;
      admin_mobile_number: string;
    }

    const profile = await queryOne<ProfileData>(
      `SELECT id, email, full_name, position, mobile, role, is_primary_admin,
              module_access, managed_password
       FROM profiles
       WHERE id = $1`,
      [auth.profile.id]
    );

    const lgu = await queryOne<LguData>(
      `SELECT id, province, municipality, street_address, status, support_plan,
              subscription_amount, subscription_start_date, subscription_end_date,
              document_count, admin_full_name, admin_position, admin_office_email,
              admin_mobile_number
       FROM lgus
       WHERE id = $1`,
      [auth.profile.lgu_id]
    );

    return ok(res, {
      ...profile,
      lgu,
    });
  },

  async billingOverview(req: Request, res: Response) {
    const auth = requireLgu(req);

    interface BillingOverview {
      subscription_amount: string;
      subscription_start_date: string;
      subscription_end_date: string;
      status: string;
      support_plan: string | null;
      document_count: number;
    }

    const overview = await queryOne<BillingOverview>(
      `SELECT subscription_amount, subscription_start_date, subscription_end_date,
              status, support_plan, document_count
       FROM lgus
       WHERE id = $1`,
      [auth.profile.lgu_id]
    );

    return ok(res, overview);
  },

  async billingHistory(req: Request, res: Response) {
    const auth = requireLgu(req);

    interface BillingHistoryRow {
      id: string;
      amount: string;
      start_date: string;
      end_date: string;
      status: string;
      created_at: string;
    }

    const history = await queryAll<BillingHistoryRow>(
      `SELECT id, amount, start_date, end_date, status, created_at
       FROM lgu_subscription_periods
       WHERE lgu_id = $1
       ORDER BY created_at DESC`,
      [auth.profile.lgu_id]
    );

    return ok(res, history);
  },
};
