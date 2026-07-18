"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { usePlaceFilter } from "@/lib/place-filter-context";
import { buildLguPath, parseLguPath } from "@/lib/lgu-path";

/**
 * Builds public hrefs under the current LGU path when available,
 * e.g. /ordinances → /bohol/panglao/ordinances
 */
export function useLguHref() {
  const pathname = usePathname();
  const { province, municipality } = usePlaceFilter();

  const place = useMemo(() => {
    const fromPath = parseLguPath(pathname);
    if (fromPath) {
      return { province: fromPath.province, municipality: fromPath.municipality };
    }
    return { province, municipality };
  }, [pathname, province, municipality]);

  const href = useCallback(
    (rest: string) => buildLguPath(place.province, place.municipality, rest),
    [place.province, place.municipality]
  );

  return { href, province: place.province, municipality: place.municipality };
}
