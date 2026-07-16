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
}

const PlaceFilterContext = createContext<PlaceFilterContextValue | null>(null);

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
  const [place, setPlace] = useState({
    province: DEFAULT_PROVINCE,
    municipality: DEFAULT_MUNICIPALITY,
  });

  useEffect(() => {
    setPlace(loadStoredPlace());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PLACE_FILTER_STORAGE_KEY, JSON.stringify(place));
    } catch {
      /* ignore storage errors */
    }
  }, [place]);

  const setProvince = useCallback((province: string) => {
    setPlace((current) => {
      if (current.province === province) return current;
      const municipality =
        province === current.province && isValidPlace(province, current.municipality)
          ? current.municipality
          : getDefaultMunicipalityForProvince(province);
      return { province, municipality };
    });
  }, []);

  const setMunicipality = useCallback((municipality: string) => {
    setPlace((current) => ({ ...current, municipality }));
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
    };
  }, [place.province, place.municipality, setProvince, setMunicipality]);

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
