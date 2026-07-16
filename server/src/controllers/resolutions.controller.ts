import type { Request, Response } from "express";
import { query, queryAll, queryOne } from "../lib/db.js";
import { toPublicFileUrl } from "../lib/auth-tokens.js";
import type { ResolutionRow } from "../models/resolution.js";
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

const RESOLUTION_COLUMNS = `
  id, lgu_id, resolution_number, series_year, title, author_sponsor,
  category, pdf_storage_path, status, is_public,
  created_by, created_at, updated_at
`;

export const resolutionsController = {
  async list(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const rows = await queryAll<ResolutionRow>(
      `SELECT ${RESOLUTION_COLUMNS}
       FROM resolutions
       WHERE lgu_id = $1
       ORDER BY series_year DESC, resolution_number ASC`,
      [auth.profile.lgu_id]
    );

    return ok(res, rows);
  },

  async getById(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const row = await queryOne<ResolutionRow>(
      `SELECT ${RESOLUTION_COLUMNS}
       FROM resolutions
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, req.params.id]
    );

    if (!row) throw new NotFoundError("Resolution not found");

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

    const {
      resolutionNumber,
      seriesYear,
      title,
      authorSponsor,
      category,
    } = req.body;

    // Validate required fields
    if (!resolutionNumber || !seriesYear || !title || !authorSponsor || !category) {
      throw new AppError("Missing required fields", 400);
    }

    const pdfPath = relativePathFromFile(
      auth.profile.lgu_id,
      "resolutions",
      req.file
    );

    try {
      const result = await queryOne<{ id: string }>(
        `INSERT INTO resolutions (
          lgu_id, resolution_number, series_year, title, author_sponsor,
          category, pdf_storage_path, status, is_public, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          auth.profile.lgu_id,
          resolutionNumber,
          parseInt(seriesYear, 10),
          title,
          authorSponsor,
          category,
          pdfPath,
          "published",
          true,
          auth.profile.id,
        ]
      );

      if (!result) throw new AppError("Failed to create resolution", 500);

      // Bump document count
      await bumpDocumentCount(auth.profile.lgu_id, 1);

      // Record activity
      await recordActivity({
        lguId: auth.profile.lgu_id,
        userId: auth.profile.id,
        userName: auth.profile.full_name,
        action: "upload",
        module: "resolutions",
        entityId: result.id,
        entityTitle: title,
        details: `Created resolution ${resolutionNumber}`,
      });

      return ok(res, { id: result.id });
    } catch (err: any) {
      // Clean up uploaded file on error
      await deleteUploadedFile(pdfPath);

      // Handle unique constraint violation
      if (err.code === "23505") {
        throw new ConflictError(
          "A resolution with this number and series year already exists"
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
    const {
      resolutionNumber,
      seriesYear,
      title,
      authorSponsor,
      category,
    } = req.body;

    // Check if resolution exists
    const existing = await queryOne<ResolutionRow>(
      `SELECT ${RESOLUTION_COLUMNS}
       FROM resolutions
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!existing) throw new NotFoundError("Resolution not found");

    let newPdfPath: string | null = null;
    const oldPdfPath = existing.pdf_storage_path;

    // Handle PDF replacement
    if (req.file) {
      newPdfPath = relativePathFromFile(
        auth.profile.lgu_id,
        "resolutions",
        req.file
      );
    }

    try {
      await query(
        `UPDATE resolutions
         SET resolution_number = COALESCE($1, resolution_number),
             series_year = COALESCE($2, series_year),
             title = COALESCE($3, title),
             author_sponsor = COALESCE($4, author_sponsor),
             category = COALESCE($5, category),
             pdf_storage_path = COALESCE($6, pdf_storage_path),
             updated_at = NOW()
         WHERE lgu_id = $7 AND id = $8`,
        [
          resolutionNumber || null,
          seriesYear ? parseInt(seriesYear, 10) : null,
          title || null,
          authorSponsor || null,
          category || null,
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
        module: "resolutions",
        entityId: id,
        entityTitle: title || existing.title,
        details: `Updated resolution ${resolutionNumber || existing.resolution_number}`,
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
          "A resolution with this number and series year already exists"
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

    // Get the resolution to delete
    const resolution = await queryOne<ResolutionRow>(
      `SELECT ${RESOLUTION_COLUMNS}
       FROM resolutions
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!resolution) throw new NotFoundError("Resolution not found");

    // Delete from database
    await query(
      `DELETE FROM resolutions WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    // Delete PDF file
    await deleteUploadedFile(resolution.pdf_storage_path);

    // Decrement document count
    await bumpDocumentCount(auth.profile.lgu_id, -1);

    // Record activity
    await recordActivity({
      lguId: auth.profile.lgu_id,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "delete",
      module: "resolutions",
      entityId: id,
      entityTitle: resolution.title,
      details: `Deleted resolution ${resolution.resolution_number}`,
    });

    return ok(res, { success: true });
  },

  async togglePublish(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id || !auth?.profile.id) {
      throw new UnauthorizedError();
    }

    const { id } = req.params;

    // Get current resolution
    const resolution = await queryOne<ResolutionRow>(
      `SELECT ${RESOLUTION_COLUMNS}
       FROM resolutions
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!resolution) throw new NotFoundError("Resolution not found");

    const newIsPublic = !resolution.is_public;
    const newStatus = newIsPublic ? "published" : "draft";

    // Toggle is_public and update status
    await query(
      `UPDATE resolutions
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
      module: "resolutions",
      entityId: id,
      entityTitle: resolution.title,
      details: newIsPublic
        ? `Published resolution ${resolution.resolution_number}`
        : `Unpublished resolution ${resolution.resolution_number}`,
    });

    return ok(res, { is_public: newIsPublic, status: newStatus });
  },
};
