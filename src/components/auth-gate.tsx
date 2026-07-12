"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminPageLoaderCentered } from "@/components/admin/admin-page-loader";
import type { AccountPortal } from "@/lib/types";

interface AuthGateProps {
  portal: AccountPortal;
  children: ReactNode;
}

export function AuthGate({ portal, children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isLoading,
    isTabUnlocked,
    portal: sessionPortal,
  } = useAuth();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setAllowed(false);
      return;
    }

    const next = pathname && pathname !== "/" ? pathname : undefined;
    const loginHref = next
      ? `/login?next=${encodeURIComponent(next)}`
      : "/login";

    // Same-tab login sets isTabUnlocked. A pasted URL in a new tab has
    // cookies but no unlock → always require login again.
    if (!isAuthenticated || !sessionPortal || !isTabUnlocked) {
      setAllowed(false);
      router.replace(loginHref);
      return;
    }

    if (sessionPortal !== portal) {
      setAllowed(false);
      router.replace(loginHref);
      return;
    }

    setAllowed(true);
  }, [
    isLoading,
    isAuthenticated,
    isTabUnlocked,
    sessionPortal,
    portal,
    pathname,
    router,
  ]);

  if (isLoading || !allowed) {
    return <AdminPageLoaderCentered className="min-h-screen" />;
  }

  return <>{children}</>;
}
