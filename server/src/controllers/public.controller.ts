import type { Request, Response } from "express";
import { queryAll, queryOne } from "../lib/db.js";
import { toPublicFileUrl } from "../lib/auth-tokens.js";
import type { LguRow } from "../models/lgu.js";
import type { OrdinanceRow } from "../models/ordinance.js";
import type { ResolutionRow } from "../models/resolution.js";
import type { SessionMinutesRow } from "../models/session-minutes.js";
import type { CategoryRow } from "../models/category.js";
import type { CsoRow } from "../models/cso.js";
import type { SbMemberRow } from "../models/sb-member.js";
import type { CommitteeRow } from "../models/committee.js";
import { ok } from "../utils/api-response.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import { decodePlaceParam } from "../utils/place.js";

const LGU_COLUMNS = `
  id, province, municipality, status, subscription_amount,
  subscription_start_date, subscription_end_date, street_address,
  support_plan, document_count, admin_full_name, admin_position,
  admin_office_email, admin_mobile_number, created_at, updated_at
`;

async function resolveLguId(
  provinceParam: string,
  municipalityParam: string
): Promise<{ lguId: string; lgu: LguRow }> {
  const province = decodePlaceParam(provinceParam);
  const municipality = decodePlaceParam(municipalityParam);

  const lgu = await queryOne<LguRow>(
    `SELECT ${LGU_COLUMNS}
     FROM lgus
     WHERE province = $1 AND municipality = $2`,
    [province, municipality]
  );

  if (!lgu) throw new NotFoundError("LGU not found for this place");
  return { lguId: lgu.id, lgu };
}

export const publicController = {
  async contact(req: Request, res: Response) {
    const { lgu } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    return ok(res, {
      province: lgu.province,
      municipality: lgu.municipality,
      streetAddress: lgu.street_address,
      adminFullName: lgu.admin_full_name,
      adminPosition: lgu.admin_position,
      adminOfficeEmail: lgu.admin_office_email,
      adminMobileNumber: lgu.admin_mobile_number,
    });
  },

  async listOrdinances(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const rows = await queryAll<OrdinanceRow>(
      `SELECT id, lgu_id, ordinance_number, series_year, title, author_sponsor,
              category, ordinance_kind, pdf_storage_path, status, is_public,
              created_by, created_at, updated_at
       FROM ordinances
       WHERE lgu_id = $1 AND is_public = true AND status = 'published'
       ORDER BY series_year DESC, ordinance_number ASC`,
      [lguId]
    );

    return ok(res, rows);
  },

  async getOrdinance(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const row = await queryOne<OrdinanceRow>(
      `SELECT id, lgu_id, ordinance_number, series_year, title, author_sponsor,
              category, ordinance_kind, pdf_storage_path, status, is_public,
              created_by, created_at, updated_at
       FROM ordinances
       WHERE lgu_id = $1 AND id = $2
         AND is_public = true AND status = 'published'`,
      [lguId, req.params.id]
    );

    if (!row) throw new NotFoundError("Ordinance not found");

    return ok(res, {
      ...row,
      pdfUrl: toPublicFileUrl(row.pdf_storage_path),
    });
  },

  async listResolutions(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const rows = await queryAll<ResolutionRow>(
      `SELECT id, lgu_id, resolution_number, series_year, title, author_sponsor,
              category, pdf_storage_path, status, is_public,
              created_by, created_at, updated_at
       FROM resolutions
       WHERE lgu_id = $1 AND is_public = true AND status = 'published'
       ORDER BY series_year DESC, resolution_number ASC`,
      [lguId]
    );

    return ok(res, rows);
  },

  async getResolution(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const row = await queryOne<ResolutionRow>(
      `SELECT id, lgu_id, resolution_number, series_year, title, author_sponsor,
              category, pdf_storage_path, status, is_public,
              created_by, created_at, updated_at
       FROM resolutions
       WHERE lgu_id = $1 AND id = $2
         AND is_public = true AND status = 'published'`,
      [lguId, req.params.id]
    );

    if (!row) throw new NotFoundError("Resolution not found");

    return ok(res, {
      ...row,
      pdfUrl: toPublicFileUrl(row.pdf_storage_path),
    });
  },

  async listMinutes(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const rows = await queryAll<SessionMinutesRow>(
      `SELECT id, lgu_id, session_date, session_type, pdf_storage_path, status,
              is_public, created_by, created_at, updated_at
       FROM session_minutes
       WHERE lgu_id = $1 AND is_public = true AND status = 'published'
       ORDER BY session_date DESC`,
      [lguId]
    );

    return ok(res, rows);
  },

  async getMinutes(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const row = await queryOne<SessionMinutesRow>(
      `SELECT id, lgu_id, session_date, session_type, pdf_storage_path, status,
              is_public, created_by, created_at, updated_at
       FROM session_minutes
       WHERE lgu_id = $1 AND id = $2
         AND is_public = true AND status = 'published'`,
      [lguId, req.params.id]
    );

    if (!row) throw new NotFoundError("Session minutes not found");

    return ok(res, {
      ...row,
      pdfUrl: toPublicFileUrl(row.pdf_storage_path),
    });
  },

  async listCategories(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const rows = await queryAll<CategoryRow>(
      `SELECT id, lgu_id, name, is_active, sort_order, created_by, created_at, updated_at
       FROM document_categories
       WHERE lgu_id = $1 AND is_active = true
       ORDER BY sort_order ASC`,
      [lguId]
    );

    return ok(res, rows);
  },

  async listCso(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const rows = await queryAll<CsoRow>(
      `SELECT id, lgu_id, name, officer_name, position, term,
              created_by, created_at, updated_at
       FROM cso_organizations
       WHERE lgu_id = $1
       ORDER BY name ASC`,
      [lguId]
    );

    return ok(res, rows);
  },

  async sbChart(req: Request, res: Response) {
    const { lguId } = await resolveLguId(
      req.params.province!,
      req.params.municipality!
    );

    const [members, committees] = await Promise.all([
      queryAll<SbMemberRow>(
        `SELECT id, lgu_id, name, position_slot, position, image_storage_path,
                committees, created_by, created_at, updated_at
         FROM sb_members WHERE lgu_id = $1 ORDER BY name ASC`,
        [lguId]
      ),
      queryAll<CommitteeRow>(
        `SELECT id, lgu_id, name, chairman_id, vice_chairman_id, member_ids,
                created_by, created_at, updated_at
         FROM committees WHERE lgu_id = $1 ORDER BY name ASC`,
        [lguId]
      ),
    ]);

    return ok(res, { members, committees });
  },

  async recordDownload(req: Request, res: Response) {
    const body = req.body as {
      province?: string;
      municipality?: string;
      documentId?: string;
      documentType?: string;
      documentNumber?: string;
      documentTitle?: string;
      documentCategory?: string;
      requesterName?: string;
      officeOrg?: string;
      purpose?: string;
      consentAgreed?: boolean;
    };

    if (!body.consentAgreed) {
      throw new AppError(
        "You must agree to the Privacy Notice and Terms of Use.",
        400
      );
    }
    const officeOrg = (body.officeOrg ?? "").trim();
    const purpose = (body.purpose ?? "").trim();
    if (!officeOrg) {
      throw new AppError("Office / Organization / Establishment is required.", 400);
    }
    if (!purpose) throw new AppError("Purpose is required.", 400);
    if (!body.documentId || !body.documentType) {
      throw new AppError("Document details are required.", 400);
    }

    const { lguId } = await resolveLguId(
      body.province ?? "",
      body.municipality ?? ""
    );

    const row = await queryOne<{ id: string }>(
      `INSERT INTO document_download_logs (
        lgu_id, document_id, document_type, document_number,
        document_title, document_category, requester_name, office_org,
        purpose, consent_agreed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING id`,
      [
        lguId,
        body.documentId,
        body.documentType,
        body.documentNumber ?? "",
        body.documentTitle ?? "",
        body.documentCategory ?? "",
        (body.requesterName ?? "").trim(),
        officeOrg,
        purpose,
      ]
    );

    return ok(res, { id: row?.id }, 201);
  },
};
