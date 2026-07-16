import type { Request, Response } from "express";
import { query, queryAll, queryOne } from "../lib/db.js";
import type { CategoryRow } from "../models/category.js";
import { ok } from "../utils/api-response.js";
import { AppError, NotFoundError, UnauthorizedError } from "../utils/errors.js";

const CATEGORY_COLUMNS = `
  id, lgu_id, name, is_active, sort_order, created_by, created_at, updated_at
`;

export const categoriesController = {
  async list(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const activeOnly = req.query.active === "true";
    const rows = activeOnly
      ? await queryAll<CategoryRow>(
          `SELECT ${CATEGORY_COLUMNS}
           FROM document_categories
           WHERE lgu_id = $1 AND is_active = true
           ORDER BY sort_order ASC`,
          [auth.profile.lgu_id]
        )
      : await queryAll<CategoryRow>(
          `SELECT ${CATEGORY_COLUMNS}
           FROM document_categories
           WHERE lgu_id = $1
           ORDER BY sort_order ASC`,
          [auth.profile.lgu_id]
        );

    return ok(res, rows);
  },

  async create(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Category name is required", 400);
    }

    const maxSortOrder = await queryOne<{ max: number | null }>(
      `SELECT MAX(sort_order) AS max FROM document_categories WHERE lgu_id = $1`,
      [auth.profile.lgu_id]
    );

    const sortOrder = (maxSortOrder?.max ?? -1) + 1;

    const row = await queryOne<CategoryRow>(
      `INSERT INTO document_categories (lgu_id, name, is_active, sort_order, created_by)
       VALUES ($1, $2, true, $3, $4)
       RETURNING ${CATEGORY_COLUMNS}`,
      [auth.profile.lgu_id, name.trim(), sortOrder, auth.profile.id]
    );

    return ok(res, row);
  },

  async update(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const { id } = req.params;
    const { name, isActive } = req.body;

    const existing = await queryOne<CategoryRow>(
      `SELECT id FROM document_categories WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined && typeof name === "string" && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (isActive !== undefined && typeof isActive === "boolean") {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    values.push(id, auth.profile.lgu_id);

    const row = await queryOne<CategoryRow>(
      `UPDATE document_categories
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex++} AND lgu_id = $${paramIndex++}
       RETURNING ${CATEGORY_COLUMNS}`,
      values
    );

    return ok(res, row);
  },

  async remove(req: Request, res: Response) {
    const auth = req.auth;
    if (!auth?.profile.lgu_id) throw new UnauthorizedError();

    const { id } = req.params;

    const existing = await queryOne<CategoryRow>(
      `SELECT id FROM document_categories WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    await query(
      `DELETE FROM document_categories WHERE id = $1 AND lgu_id = $2`,
      [id, auth.profile.lgu_id]
    );

    return ok(res, { success: true });
  },
};
