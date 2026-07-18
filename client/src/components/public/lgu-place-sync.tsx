"use client";

import { useEffect } from "react";
import { usePlaceFilter } from "@/lib/place-filter-context";

/**
 * Keeps the public place filter aligned with the LGU SEO path
 * (e.g. /bohol/panglao → Panglao, Bohol).
 */
export function LguPlaceSync({
  province,
  municipality,
}: {
  province: string;
  municipality: string;
}) {
  const { setPlace, province: currentProvince, municipality: currentMunicipality } =
    usePlaceFilter();

  useEffect(() => {
    if (
      currentProvince === province &&
      currentMunicipality === municipality
    ) {
      return;
    }
    setPlace(province, municipality);
  }, [
    province,
    municipality,
    currentProvince,
    currentMunicipality,
    setPlace,
  ]);

  return null;
}
