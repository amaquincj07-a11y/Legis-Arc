import type { Request, Response } from "express";
import { query, queryAll, queryOne } from "../lib/db.js";
import { toPublicFileUrl } from "../lib/auth-tokens.js";
import type { SessionMinutesRow } from "../models/session-minutes.js";
import { ok } from "../utils/api-response.js";
import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  AppError,
} from "../utils/errors.js";
import {
  relativePathFromFile,
  deleteUploadedFile,
} from "../lib/upload.js";
import { recordActivity, bumpDocumentCount } from "../lib/activity.js";

const MINUTES_COLUMNS = `
  id, lgu_id, session_date, session_type, pdf_storage_path, status,
  is_public, created_by, created_at, updated_at
`;

export const minutesController = {
  async list(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const rows = await queryAll<SessionMinutesRow>(
      `SELECT ${MINUTES_COLUMNS}
       FROM session_minutes
       WHERE lgu_id = $1
       ORDER BY session_date DESC`,
      [auth.profile.lgu_id]
    );

    return ok(res, rows);
  },

  async getById(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const row = await queryOne<SessionMinutesRow>(
      `SELECT ${MINUTES_COLUMNS}
       FROM session_minutes
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, req.params.id]
    );

    if (!row) throw new NotFoundError("Session minutes not found");

    return ok(res, {
      ...row,
      pdfUrl: toPublicFileUrl(row.pdf_storage_path),
    });
  },

  async create(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id || !auth?.profile.id) {
      throw new UnauthorizedError();
    }

    // Require PDF file
    if (!req.file) {
      throw new AppError("PDF file is required", 400);
    }

    const { sessionDate, sessionType } = req.body;

    // Validate required fields
    if (!sessionDate || !sessionType) {
      throw new AppError("Missing required fields", 400);
    }

    // Validate session type
    if (sessionType !== "regular" && sessionType !== "special") {
      throw new AppError("Session type must be 'regular' or 'special'", 400);
    }

    const pdfPath = relativePathFromFile(
      auth.profile.lgu_id,
      "minutes",
      req.file
    );

    try {
      const result = await queryOne<{ id: string }>(
        `INSERT INTO session_minutes (
          lgu_id, session_date, session_type, pdf_storage_path,
          status, is_public, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          auth.profile.lgu_id,
          sessionDate,
          sessionType,
          pdfPath,
          "published",
          true,
          auth.profile.id,
        ]
      );

      if (!result) throw new AppError("Failed to create session minutes", 500);

      // Bump document count
      await bumpDocumentCount(auth.profile.lgu_id, 1);

      // Record activity
      await recordActivity({
        lguId: auth.profile.lgu_id,
        userId: auth.profile.id,
        userName: auth.profile.full_name,
        action: "upload",
        module: "minutes",
        entityId: result.id,
        entityTitle: `${sessionType} session on ${sessionDate}`,
        details: `Created ${sessionType} session minutes for ${sessionDate}`,
      });

      return ok(res, { id: result.id });
    } catch (err: any) {
      // Clean up uploaded file on error
      await deleteUploadedFile(pdfPath);

      // Handle unique constraint violation
      if (err.code === "23505") {
        throw new ConflictError(
          "Session minutes for this date and type already exist"
        );
      }
      throw err;
    }
  },

  async update(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id || !auth?.profile.id) {
      throw new UnauthorizedError();
    }

    const { id } = req.params;
    const { sessionDate, sessionType } = req.body;

    // Validate session type if provided
    if (sessionType && sessionType !== "regular" && sessionType !== "special") {
      throw new AppError("Session type must be 'regular' or 'special'", 400);
    }

    // Check if minutes exist
    const existing = await queryOne<SessionMinutesRow>(
      `SELECT ${MINUTES_COLUMNS}
       FROM session_minutes
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!existing) throw new NotFoundError("Session minutes not found");

    let newPdfPath: string | null = null;
    const oldPdfPath = existing.pdf_storage_path;

    // Handle PDF replacement
    if (req.file) {
      newPdfPath = relativePathFromFile(
        auth.profile.lgu_id,
        "minutes",
        req.file
      );
    }

    try {
      await query(
        `UPDATE session_minutes
         SET session_date = COALESCE($1, session_date),
             session_type = COALESCE($2, session_type),
             pdf_storage_path = COALESCE($3, pdf_storage_path),
             updated_at = NOW()
         WHERE lgu_id = $4 AND id = $5`,
        [
          sessionDate || null,
          sessionType || null,
          newPdfPath,
          auth.profile.lgu_id,
          id,
        ]
      );

      // Delete old PDF if new one was uploaded
      if (newPdfPath && oldPdfPath) {
        await deleteUploadedFile(oldPdfPath);
      }

      // Record activity
      await recordActivity({
        lguId: auth.profile.lgu_id,
        userId: auth.profile.id,
        userName: auth.profile.full_name,
        action: "edit",
        module: "minutes",
        entityId: id,
        entityTitle: `${sessionType || existing.session_type} session on ${sessionDate || existing.session_date}`,
        details: `Updated session minutes for ${sessionDate || existing.session_date}`,
      });

      return ok(res, { id });
    } catch (err: any) {
      // Clean up new file on error
      if (newPdfPath) {
        await deleteUploadedFile(newPdfPath);
      }

      // Handle unique constraint violation
      if (err.code === "23505") {
        throw new ConflictError(
          "Session minutes for this date and type already exist"
        );
      }
      throw err;
    }
  },

  async remove(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id || !auth?.profile.id) {
      throw new UnauthorizedError();
    }

    const { id } = req.params;

    // Get the minutes to delete
    const minutes = await queryOne<SessionMinutesRow>(
      `SELECT ${MINUTES_COLUMNS}
       FROM session_minutes
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!minutes) throw new NotFoundError("Session minutes not found");

    // Delete from database
    await query(
      `DELETE FROM session_minutes WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    // Delete PDF file
    await deleteUploadedFile(minutes.pdf_storage_path);

    // Decrement document count
    await bumpDocumentCount(auth.profile.lgu_id, -1);

    // Record activity
    await recordActivity({
      lguId: auth.profile.lgu_id,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "delete",
      module: "minutes",
      entityId: id,
      entityTitle: `${minutes.session_type} session on ${minutes.session_date}`,
      details: `Deleted session minutes for ${minutes.session_date}`,
    });

    return ok(res, { success: true });
  },

  async togglePublish(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id || !auth?.profile.id) {
      throw new UnauthorizedError();
    }

    const { id } = req.params;

    // Get current minutes
    const minutes = await queryOne<SessionMinutesRow>(
      `SELECT ${MINUTES_COLUMNS}
       FROM session_minutes
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!minutes) throw new NotFoundError("Session minutes not found");

    const newIsPublic = !minutes.is_public;
    const newStatus = newIsPublic ? "published" : "draft";

    // Toggle is_public and update status
    await query(
      `UPDATE session_minutes
       SET is_public = $1, status = $2, updated_at = NOW()
       WHERE lgu_id = $3 AND id = $4`,
      [newIsPublic, newStatus, auth.profile.lgu_id, id]
    );

    // Record activity
    await recordActivity({
      lguId: auth.profile.lgu_id,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "publish",
      module: "minutes",
      entityId: id,
      entityTitle: `${minutes.session_type} session on ${minutes.session_date}`,
      details: newIsPublic
        ? `Published session minutes for ${minutes.session_date}`
        : `Unpublished session minutes for ${minutes.session_date}`,
    });

    return ok(res, { is_public: newIsPublic, status: newStatus });
  },
};
