import type { AccountPortal } from "@/lib/types";

const TAB_SESSION_KEY = "legisarc_admin_tab_session";

export interface TabSession {
  portal: AccountPortal;
  userId: string;
  unlockedAt: number;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function getTabSession(): TabSession | null {
  if (!canUseSessionStorage()) return null;

  try {
    const raw = sessionStorage.getItem(TAB_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<TabSession>;
    if (
      (parsed.portal !== "lgu" && parsed.portal !== "company") ||
      typeof parsed.userId !== "string" ||
      !parsed.userId
    ) {
      return null;
    }

    return {
      portal: parsed.portal,
      userId: parsed.userId,
      unlockedAt:
        typeof parsed.unlockedAt === "number" ? parsed.unlockedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function setTabSession(portal: AccountPortal, userId: string): void {
  if (!canUseSessionStorage()) return;

  const payload: TabSession = {
    portal,
    userId,
    unlockedAt: Date.now(),
  };

  sessionStorage.setItem(TAB_SESSION_KEY, JSON.stringify(payload));
}

export function clearTabSession(): void {
  if (!canUseSessionStorage()) return;
  sessionStorage.removeItem(TAB_SESSION_KEY);
}

export function hasValidTabSession(
  portal: AccountPortal,
  userId?: string | null
): boolean {
  const session = getTabSession();
  if (!session || session.portal !== portal) return false;
  if (userId && session.userId !== userId) return false;
  return true;
}
