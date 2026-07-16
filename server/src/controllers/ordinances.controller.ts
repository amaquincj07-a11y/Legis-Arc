import type { Request, Response } from "express";
import { query, queryAll, queryOne } from "../lib/db.js";
import { toPublicFileUrl } from "../lib/auth-tokens.js";
import type { OrdinanceRow } from "../models/ordinance.js";
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

const ORDINANCE_COLUMNS = `
  id, lgu_id, ordinance_number, series_year, title, author_sponsor,
  category, ordinance_kind, pdf_storage_path, status, is_public,
  created_by, created_at, updated_at
`;

export const ordinancesController = {
  async list(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const rows = await queryAll<OrdinanceRow>(
      `SELECT ${ORDINANCE_COLUMNS}
       FROM ordinances
       WHERE lgu_id = $1
       ORDER BY series_year DESC, ordinance_number ASC`,
      [auth.profile.lgu_id]
    );

    return ok(res, rows);
  },

  async getById(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const row = await queryOne<OrdinanceRow>(
      `SELECT ${ORDINANCE_COLUMNS}
       FROM ordinances
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, req.params.id]
    );

    if (!row) throw new NotFoundError("Ordinance not found");

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
      ordinanceNumber,
      seriesYear,
      title,
      authorSponsor,
      category,
      ordinanceKind = "municipal",
    } = req.body;

    // Validate required fields
    if (!ordinanceNumber || !seriesYear || !title || !authorSponsor || !category) {
      throw new AppError("Missing required fields", 400);
    }

    const pdfPath = relativePathFromFile(
      auth.profile.lgu_id,
      "ordinances",
      req.file
    );

    try {
      const result = await queryOne<{ id: string }>(
        `INSERT INTO ordinances (
          lgu_id, ordinance_number, series_year, title, author_sponsor,
          category, ordinance_kind, pdf_storage_path, status, is_public, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          auth.profile.lgu_id,
          ordinanceNumber,
          parseInt(seriesYear, 10),
          title,
          authorSponsor,
          category,
          ordinanceKind,
          pdfPath,
          "published",
          true,
          auth.profile.id,
        ]
      );

      if (!result) throw new AppError("Failed to create ordinance", 500);

      // Bump document count
      await bumpDocumentCount(auth.profile.lgu_id, 1);

      // Record activity
      await recordActivity({
        lguId: auth.profile.lgu_id,
        userId: auth.profile.id,
        userName: auth.profile.full_name,
        action: "upload",
        module: "ordinances",
        entityId: result.id,
        entityTitle: title,
        details: `Created ordinance ${ordinanceNumber}`,
      });

      return ok(res, { id: result.id });
    } catch (err: any) {
      // Clean up uploaded file on error
      await deleteUploadedFile(pdfPath);

      // Handle unique constraint violation
      if (err.code === "23505") {
        throw new ConflictError(
          "An ordinance with this number and series year already exists"
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
      ordinanceNumber,
      seriesYear,
      title,
      authorSponsor,
      category,
      ordinanceKind,
    } = req.body;

    // Check if ordinance exists
    const existing = await queryOne<OrdinanceRow>(
      `SELECT ${ORDINANCE_COLUMNS}
       FROM ordinances
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!existing) throw new NotFoundError("Ordinance not found");

    let newPdfPath: string | null = null;
    const oldPdfPath = existing.pdf_storage_path;

    // Handle PDF replacement
    if (req.file) {
      newPdfPath = relativePathFromFile(
        auth.profile.lgu_id,
        "ordinances",
        req.file
      );
    }

    try {
      await query(
        `UPDATE ordinances
         SET ordinance_number = COALESCE($1, ordinance_number),
             series_year = COALESCE($2, series_year),
             title = COALESCE($3, title),
             author_sponsor = COALESCE($4, author_sponsor),
             category = COALESCE($5, category),
             ordinance_kind = COALESCE($6, ordinance_kind),
             pdf_storage_path = COALESCE($7, pdf_storage_path),
             updated_at = NOW()
         WHERE lgu_id = $8 AND id = $9`,
        [
          ordinanceNumber || null,
          seriesYear ? parseInt(seriesYear, 10) : null,
          title || null,
          authorSponsor || null,
          category || null,
          ordinanceKind || null,
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
        module: "ordinances",
        entityId: id,
        entityTitle: title || existing.title,
        details: `Updated ordinance ${ordinanceNumber || existing.ordinance_number}`,
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
          "An ordinance with this number and series year already exists"
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

    // Get the ordinance to delete
    const ordinance = await queryOne<OrdinanceRow>(
      `SELECT ${ORDINANCE_COLUMNS}
       FROM ordinances
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!ordinance) throw new NotFoundError("Ordinance not found");

    // Delete from database
    await query(
      `DELETE FROM ordinances WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    // Delete PDF file
    await deleteUploadedFile(ordinance.pdf_storage_path);

    // Decrement document count
    await bumpDocumentCount(auth.profile.lgu_id, -1);

    // Record activity
    await recordActivity({
      lguId: auth.profile.lgu_id,
      userId: auth.profile.id,
      userName: auth.profile.full_name,
      action: "delete",
      module: "ordinances",
      entityId: id,
      entityTitle: ordinance.title,
      details: `Deleted ordinance ${ordinance.ordinance_number}`,
    });

    return ok(res, { success: true });
  },

  async togglePublish(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id || !auth?.profile.id) {
      throw new UnauthorizedError();
    }

    const { id } = req.params;

    // Get current ordinance
    const ordinance = await queryOne<OrdinanceRow>(
      `SELECT ${ORDINANCE_COLUMNS}
       FROM ordinances
       WHERE lgu_id = $1 AND id = $2`,
      [auth.profile.lgu_id, id]
    );

    if (!ordinance) throw new NotFoundError("Ordinance not found");

    const newIsPublic = !ordinance.is_public;
    const newStatus = newIsPublic ? "published" : "draft";

    // Toggle is_public and update status
    await query(
      `UPDATE ordinances
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
      module: "ordinances",
      entityId: id,
      entityTitle: ordinance.title,
      details: newIsPublic
        ? `Published ordinance ${ordinance.ordinance_number}`
        : `Unpublished ordinance ${ordinance.ordinance_number}`,
    });

    return ok(res, { is_public: newIsPublic, status: newStatus });
  },
};
