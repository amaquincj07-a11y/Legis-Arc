"use server";

import { apiRequest } from "@/lib/api/client";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PasswordResetRequestResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function requestLguPasswordResetAction(
  email: string,
  redirectTo: string
): Promise<PasswordResetRequestResult> {
  try {
    await apiRequest("/api/auth/password-reset/request", {
      method: "POST",
      body: { email, redirectTo },
      accessToken: null,
    });
    return {
      success: true,
      message:
        "If an account exists for that email, a reset link has been sent.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send reset email.",
    };
  }
}

export async function completePasswordResetAction(
  token: string,
  password: string
): Promise<ActionResult<null>> {
  try {
    await apiRequest("/api/auth/password-reset/complete", {
      method: "POST",
      body: { token, password },
      accessToken: null,
    });
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset password.",
    };
  }
}
