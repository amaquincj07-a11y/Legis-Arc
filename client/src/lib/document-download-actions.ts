"use server";

import {
  apiGetAuth,
  apiGetPublic,
  apiPostPublic,
  publicPlacePath,
} from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import {
  mapDocumentDownloadRowToRecord,
  type DocumentDownloadRow,
} from "@/lib/mappers/document-download-mapper";
import type {
  DocumentDownloadRecord,
  PublicDocumentDownloadContext,
} from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function documentPublicPath(
  context: PublicDocumentDownloadContext
): string {
  if (context.documentType === "ordinance") {
    return `/ordinances/${context.documentId}`;
  }
  if (context.documentType === "resolution") {
    return `/resolutions/${context.documentId}`;
  }
  return `/minutes/${context.documentId}`;
}

function defaultDownloadFileName(
  context: PublicDocumentDownloadContext
): string {
  const number = context.documentNumber?.trim();
  if (number) {
    return `${number.replace(/[^\w.-]+/g, "_")}.pdf`;
  }
  return `${context.documentType}-${context.documentId}.pdf`;
}

export async function getPublicDocumentDownloadUrlAction(
  context: PublicDocumentDownloadContext,
  downloadFileName?: string
): Promise<ActionResult<{ url: string; fileName: string }>> {
  try {
    const path = publicPlacePath(
      context.province,
      context.municipality,
      documentPublicPath(context)
    );
    const row = await apiGetPublic<{ pdfUrl?: string }>(path);
    const url = row.pdfUrl?.trim() ?? "";
    if (!url) {
      return {
        success: false,
        error: "Document file is not available for download.",
      };
    }
    return {
      success: true,
      data: {
        url,
        fileName: downloadFileName?.trim() || defaultDownloadFileName(context),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to resolve download URL.",
    };
  }
}

export async function recordPublicDocumentDownloadAction(input: {
  context: PublicDocumentDownloadContext;
  requesterName?: string;
  officeOrg: string;
  purpose: string;
  consentAgreed: boolean;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { context } = input;
    const result = await apiPostPublic<{ id: string }>(
      "/api/public/downloads",
      {
        province: context.province,
        municipality: context.municipality,
        documentId: context.documentId,
        documentType: context.documentType,
        documentNumber: context.documentNumber,
        documentTitle: context.documentTitle,
        documentCategory: context.documentCategory,
        requesterName: input.requesterName,
        officeOrg: input.officeOrg,
        purpose: input.purpose,
        consentAgreed: input.consentAgreed,
      }
    );
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to record download.",
    };
  }
}

export async function fetchDocumentDownloadLogsAction(): Promise<
  ActionResult<DocumentDownloadRecord[]>
> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<DocumentDownloadRow[]>(
      "/api/admin/download-logs",
      token
    );
    return {
      success: true,
      data: rows.map(mapDocumentDownloadRowToRecord),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load download logs.",
    };
  }
}
