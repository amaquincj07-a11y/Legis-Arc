"use server";

import { addYears, startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { apiGetAuth, apiPostAuth, apiPatchAuth } from "@/lib/api/client";
import { getServerAccessToken } from "@/lib/api/server-token";
import { mapLguRowToClient, toPlaceStorageKey, type LguRow } from "@/lib/mappers/lgu-mapper";
import type { CreateLGUAccountInput, LGUClient, LGUClientStatus, LGUAdministrator } from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchLGUClientsAction(): Promise<ActionResult<LGUClient[]>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const rows = await apiGetAuth<LguRow[]>("/api/company/lgus", token);
    return {
      success: true,
      data: rows.map(mapLguRowToClient),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load LGU clients.",
    };
  }
}

export async function fetchLGUClientByIdAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiGetAuth<LguRow>(`/api/company/lgus/${id}`, token);
    return { success: true, data: mapLguRowToClient(row) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "LGU not found.",
    };
  }
}

export async function createLGUClientAction(
  input: CreateLGUAccountInput
): Promise<ActionResult<LGUClient>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  const password = input.administrator.password?.trim() ?? "";
  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters.",
    };
  }

  try {
    const row = await apiPostAuth<LguRow>("/api/company/lgus", token, {
      province: toPlaceStorageKey(input.province),
      municipality: toPlaceStorageKey(input.municipality),
      administrator: {
        fullName: input.administrator.fullName.trim(),
        position: input.administrator.position.trim(),
        officeEmail: input.administrator.officeEmail.trim().toLowerCase(),
        mobileNumber: input.administrator.mobileNumber.trim(),
        password,
      },
    });

    revalidatePath("/super-admin/lgus");
    revalidatePath("/super-admin/dashboard");

    // Prefer a fresh fetch so Manage always includes managed_password.
    const fresh = await fetchLGUClientByIdAction(row.id);
    if (fresh.success) {
      if (!fresh.data.administrator.managedPassword) {
        fresh.data.administrator.managedPassword = password;
      }
      return fresh;
    }

    const mapped = mapLguRowToClient(row);
    if (!mapped.administrator.managedPassword) {
      mapped.administrator.managedPassword = password;
    }
    return { success: true, data: mapped };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create LGU account.",
    };
  }
}

export async function updateLGUProfileAction(
  id: string,
  administrator: LGUAdministrator,
  password?: string
): Promise<ActionResult<LGUClient>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPatchAuth<LguRow>(`/api/company/lgus/${id}`, token, {
      administrator: {
        fullName: administrator.fullName.trim(),
        position: administrator.position.trim(),
        officeEmail: administrator.officeEmail.trim().toLowerCase(),
        mobileNumber: administrator.mobileNumber.trim(),
      },
      password: password?.trim() || undefined,
    });

    revalidatePath(`/super-admin/lgus/${id}`);
    revalidatePath("/super-admin/lgus");

    return { success: true, data: mapLguRowToClient(row) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update administrator profile.",
    };
  }
}

export async function updateLGUSubscriptionAction(
  id: string,
  patch: {
    status?: LGUClientStatus;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  },
  options?: { recordPeriod?: boolean }
): Promise<ActionResult<LGUClient>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const body: Record<string, string | boolean | undefined> = {};
    if (patch.status) body.status = patch.status;
    if (patch.subscriptionStartDate) {
      body.subscriptionStartDate = patch.subscriptionStartDate.toISOString();
    }
    if (patch.subscriptionEndDate) {
      body.subscriptionEndDate = patch.subscriptionEndDate.toISOString();
    }
    if (options?.recordPeriod !== undefined) {
      body.recordPeriod = options.recordPeriod;
    }

    await apiPatchAuth(`/api/company/lgus/${id}/subscription`, token, body);

    revalidatePath(`/super-admin/lgus/${id}`);
    revalidatePath("/super-admin/lgus");
    revalidatePath("/super-admin/dashboard");
    revalidatePath("/admin/billing");

    return fetchLGUClientByIdAction(id);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update subscription.",
    };
  }
}

export async function activateLGUPaidSubscriptionTodayAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<LguRow>(`/api/company/lgus/${id}/activate`, token);

    revalidatePath(`/super-admin/lgus/${id}`);
    revalidatePath("/super-admin/lgus");
    revalidatePath("/super-admin/dashboard");

    return { success: true, data: mapLguRowToClient(row) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to activate subscription.",
    };
  }
}

export async function blockLGUAccessAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<LguRow>(`/api/company/lgus/${id}/block`, token);

    revalidatePath(`/super-admin/lgus/${id}`);
    revalidatePath("/super-admin/lgus");
    revalidatePath("/super-admin/dashboard");

    return { success: true, data: mapLguRowToClient(row) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to block access.",
    };
  }
}

export async function unblockLGUAccessAction(
  id: string
): Promise<ActionResult<LGUClient>> {
  const token = await getServerAccessToken();
  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const row = await apiPostAuth<LguRow>(`/api/company/lgus/${id}/unblock`, token);

    revalidatePath(`/super-admin/lgus/${id}`);
    revalidatePath("/super-admin/lgus");
    revalidatePath("/super-admin/dashboard");

    return { success: true, data: mapLguRowToClient(row) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unblock access.",
    };
  }
}
