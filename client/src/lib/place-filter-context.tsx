"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_MUNICIPALITY,
  DEFAULT_PROVINCE,
  PLACE_FILTER_STORAGE_KEY,
  formatPlaceName,
  getDefaultMunicipalityForProvince,
  getLguLabel,
  getProvinceLabel,
  isValidPlace,
} from "@/lib/places";
import {
  PUBLIC_PLACE_COOKIE,
  encodePlaceCookie,
  parseLguPath,
} from "@/lib/lgu-path";

interface PlaceFilterContextValue {
  province: string;
  municipality: string;
  provinceLabel: string;
  municipalityLabel: string;
  lguLabel: string;
  municipalityName: string;
  provinceName: string;
  shortLocationLabel: string;
  setProvince: (province: string) => void;
  setMunicipality: (municipality: string) => void;
  setPlace: (province: string, municipality: string) => void;
}

const PlaceFilterContext = createContext<PlaceFilterContextValue | null>(null);

function persistPlaceCookie(province: string, municipality: string) {
  if (typeof document === "undefined") return;
  try {
    const value = encodeURIComponent(encodePlaceCookie(province, municipality));
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${PUBLIC_PLACE_COOKIE}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
  } catch {
    /* ignore */
  }
}

function loadStoredPlace(): { province: string; municipality: string } {
  if (typeof window === "undefined") {
    return { province: DEFAULT_PROVINCE, municipality: DEFAULT_MUNICIPALITY };
  }

  try {
    const raw = localStorage.getItem(PLACE_FILTER_STORAGE_KEY);
    if (!raw) {
      return { province: DEFAULT_PROVINCE, municipality: DEFAULT_MUNICIPALITY };
    }
    const parsed = JSON.parse(raw) as { province?: string; municipality?: string };
    const province = parsed.province ?? DEFAULT_PROVINCE;
    const municipality = parsed.municipality ?? DEFAULT_MUNICIPALITY;
    if (isValidPlace(province, municipality)) {
      return { province, municipality };
    }
    if (isValidPlace(province, getDefaultMunicipalityForProvince(province))) {
      return { province, municipality: getDefaultMunicipalityForProvince(province) };
    }
  } catch {
    /* use defaults */
  }

  return { province: DEFAULT_PROVINCE, municipality: DEFAULT_MUNICIPALITY };
}

export function PlaceFilterProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [place, setPlaceState] = useState(() => {
    const fromPath = parseLguPath(pathname);
    if (fromPath) {
      return {
        province: fromPath.province,
        municipality: fromPath.municipality,
      };
    }
    return {
      province: DEFAULT_PROVINCE,
      municipality: DEFAULT_MUNICIPALITY,
    };
  });
  const [storageHydrated, setStorageHydrated] = useState(false);

  // Prefer LGU SEO path whenever the URL encodes a place.
  useEffect(() => {
    const fromPath = parseLguPath(pathname);
    if (!fromPath) return;
    setPlaceState((current) =>
      current.province === fromPath.province &&
      current.municipality === fromPath.municipality
        ? current
        : {
            province: fromPath.province,
            municipality: fromPath.municipality,
          }
    );
  }, [pathname]);

  // Hydrate from localStorage only when not on an LGU path.
  useEffect(() => {
    if (storageHydrated) return;
    setStorageHydrated(true);
    if (parseLguPath(pathname)) return;
    setPlaceState(loadStoredPlace());
  }, [pathname, storageHydrated]);

  useEffect(() => {
    try {
      localStorage.setItem(PLACE_FILTER_STORAGE_KEY, JSON.stringify(place));
    } catch {
      /* ignore storage errors */
    }
    persistPlaceCookie(place.province, place.municipality);
  }, [place]);

  const setPlace = useCallback((province: string, municipality: string) => {
    if (!isValidPlace(province, municipality)) return;
    setPlaceState((current) => {
      if (current.province === province && current.municipality === municipality) {
        return current;
      }
      return { province, municipality };
    });
  }, []);

  const setProvince = useCallback((province: string) => {
    setPlaceState((current) => {
      if (current.province === province) return current;
      const municipality =
        province === current.province && isValidPlace(province, current.municipality)
          ? current.municipality
          : getDefaultMunicipalityForProvince(province);
      return { province, municipality };
    });
  }, []);

  const setMunicipality = useCallback((municipality: string) => {
    setPlaceState((current) => {
      if (!isValidPlace(current.province, municipality)) return current;
      if (current.municipality === municipality) return current;
      return { ...current, municipality };
    });
  }, []);

  const value = useMemo<PlaceFilterContextValue>(() => {
    const municipalityName = formatPlaceName(place.municipality);
    const provinceName = formatPlaceName(place.province);
    return {
      province: place.province,
      municipality: place.municipality,
      provinceLabel: getProvinceLabel(place.province),
      municipalityLabel: getLguLabel(place.municipality),
      lguLabel: getLguLabel(place.municipality),
      municipalityName,
      provinceName,
      shortLocationLabel: `${municipalityName}, ${provinceName}`,
      setProvince,
      setMunicipality,
      setPlace,
    };
  }, [place.province, place.municipality, setProvince, setMunicipality, setPlace]);

  return (
    <PlaceFilterContext value={value}>{children}</PlaceFilterContext>
  );
}

export function usePlaceFilter() {
  const context = useContext(PlaceFilterContext);
  if (!context) {
    throw new Error("usePlaceFilter must be used within PlaceFilterProvider");
  }
  return context;
}
