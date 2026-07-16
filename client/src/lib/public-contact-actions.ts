"use server";

import { apiGetPublic, publicPlacePath } from "@/lib/api/client";
import { formatPlaceName } from "@/lib/places";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PublicLGUContactInfo = {
  municipalityName: string;
  provinceName: string;
  officeAddressLines: string[];
  phoneLines: string[];
  emailLines: string[];
  officeHoursLines: string[];
};

type ContactApiResponse = {
  province: string;
  municipality: string;
  streetAddress: string | null;
  adminFullName: string;
  adminPosition: string;
  adminOfficeEmail: string;
  adminMobileNumber: string;
};

const DEFAULT_OFFICE_HOURS = [
  "Monday – Friday",
  "8:00 AM – 5:00 PM",
  "Closed on weekends & holidays",
];

export async function fetchPublicLGUContactInfoAction(
  province: string,
  municipality: string
): Promise<ActionResult<PublicLGUContactInfo>> {
  try {
    const path = publicPlacePath(province, municipality, "/contact");
    const data = await apiGetPublic<ContactApiResponse>(path);

    const municipalityName = formatPlaceName(data.municipality || municipality);
    const provinceName = formatPlaceName(data.province || province);
    const street = data.streetAddress?.trim();
    const phone = data.adminMobileNumber?.trim();
    const email = data.adminOfficeEmail?.trim();

    return {
      success: true,
      data: {
        municipalityName,
        provinceName,
        officeAddressLines: street
          ? [
              "Office of the Sangguniang Bayan",
              street,
              `${municipalityName}, ${provinceName}`,
            ]
          : [
              "Office of the Sangguniang Bayan",
              `${municipalityName}, ${provinceName}`,
            ],
        phoneLines: phone
          ? [phone]
          : ["Contact information is not yet available."],
        emailLines: email
          ? [email]
          : ["Contact information is not yet available."],
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
