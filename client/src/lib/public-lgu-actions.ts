"use server";

import { apiGetPublic } from "@/lib/api/client";

export type PublicLguPlace = {
  province: string;
  municipality: string;
  status: string;
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function fetchPublicLgusAction(): Promise<
  ActionResult<PublicLguPlace[]>
> {
  try {
    const data = await apiGetPublic<PublicLguPlace[]>("/api/public/lgus");
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load public LGUs.",
    };
  }
}
