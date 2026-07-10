"use server";

import { formatPlaceName } from "@/lib/places";
import { createAdminClient } from "@/lib/supabase/admin";
import { toPlaceStorageKey } from "@/lib/supabase/lgu-mapper";

export type PublicLGUContactInfo = {
  municipalityName: string;
  provinceName: string;
  officeAddressLines: string[];
  phoneLines: string[];
  emailLines: string[];
  officeHoursLines: string[];
};

export type PublicActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const DEFAULT_OFFICE_HOURS = [
  "Monday – Friday",
  "8:00 AM – 5:00 PM",
  "Closed on weekends & holidays",
];

type ContactProfileRow = {
  email: string;
  mobile: string | null;
  is_primary_admin: boolean;
};

type ContactLguRow = {
  province: string;
  municipality: string;
  street_address: string | null;
  admin_office_email: string;
  admin_mobile_number: string;
  profiles?: ContactProfileRow[] | null;
};

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function buildAddressLines(
  municipalityName: string,
  provinceName: string,
  streetAddress: string | null
): string[] {
  const lines = ["Office of the Sangguniang Bayan"];

  if (streetAddress?.trim()) {
    lines.push(streetAddress.trim());
  }

  const locationLine = `${municipalityName}, ${provinceName}`;
  const hasLocationInAddress = streetAddress
    ?.toLowerCase()
    .includes(municipalityName.toLowerCase());

  if (!hasLocationInAddress) {
    lines.push(locationLine);
  }

  return lines;
}

export async function fetchPublicLGUContactInfoAction(
  province: string,
  municipality: string
): Promise<PublicActionResult<PublicLGUContactInfo | null>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("lgus")
      .select(
        `
        province,
        municipality,
        street_address,
        admin_office_email,
        admin_mobile_number,
        profiles (
          email,
          mobile,
          is_primary_admin
        )
      `
      )
      .eq("province", toPlaceStorageKey(province))
      .eq("municipality", toPlaceStorageKey(municipality))
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: true, data: null };
    }

    const row = data as ContactLguRow;
    const municipalityName = formatPlaceName(row.municipality);
    const provinceName = formatPlaceName(row.province);
    const primaryAdmin =
      row.profiles?.find((profile) => profile.is_primary_admin) ??
      row.profiles?.[0];

    const phoneLines = uniqueNonEmpty([
      primaryAdmin?.mobile ?? "",
      row.admin_mobile_number,
    ]);

    const emailLines = uniqueNonEmpty([
      primaryAdmin?.email ?? "",
      row.admin_office_email,
    ]);

    return {
      success: true,
      data: {
        municipalityName,
        provinceName,
        officeAddressLines: buildAddressLines(
          municipalityName,
          provinceName,
          row.street_address
        ),
        phoneLines,
        emailLines,
        officeHoursLines: DEFAULT_OFFICE_HOURS,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load contact information.",
    };
  }
}
