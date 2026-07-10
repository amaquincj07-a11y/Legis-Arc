"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminPageLoader } from "@/components/admin/admin-page-loader";

function isAdminRoute(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    return url.pathname.startsWith("/admin");
  } catch {
    return href.startsWith("/admin");
  }
}

export function AdminNavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || !isAdminRoute(href)) return;

      const nextPath = new URL(href, window.location.origin).pathname;
      if (nextPath === pathname) return;

      setIsNavigating(true);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-[1px]"
      aria-live="polite"
      aria-busy="true"
    >
      <AdminPageLoader />
    </div>
  );
}
