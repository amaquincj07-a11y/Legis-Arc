"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Landmark, Phone, Mail, Clock, MapPin } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";
import { usePlaceFilter } from "@/lib/place-filter-context";
import {
  fetchPublicLGUContactInfoAction,
  type PublicLGUContactInfo,
} from "@/lib/public-contact-actions";

function getDisplayContactInfo(
  contactInfo: PublicLGUContactInfo | null,
  municipalityName: string,
  provinceName: string
): PublicLGUContactInfo {
  return (
    contactInfo ?? {
      municipalityName,
      provinceName,
      officeAddressLines: [
        "Office of the Sangguniang Bayan",
        `${municipalityName}, ${provinceName}`,
      ],
      phoneLines: ["Contact information is not yet available."],
      emailLines: ["Contact information is not yet available."],
      officeHoursLines: [
        "Monday – Friday",
        "8:00 AM – 5:00 PM",
        "Closed on weekends & holidays",
      ],
    }
  );
}

export function PublicFooter() {
  const {
    province,
    municipality,
    municipalityName,
    provinceName,
    municipalityLabel,
  } = usePlaceFilter();

  const [contactInfo, setContactInfo] = useState<PublicLGUContactInfo | null>(
    null
  );

  const loadContactInfo = useCallback(async () => {
    const result = await fetchPublicLGUContactInfoAction(province, municipality);
    if (result.success) {
      setContactInfo(result.data);
    } else {
      setContactInfo(null);
    }
  }, [province, municipality]);

  useEffect(() => {
    void loadContactInfo();
  }, [loadContactInfo]);

  const displayInfo = getDisplayContactInfo(
    contactInfo,
    municipalityName,
    provinceName
  );

  const primaryEmail = displayInfo.emailLines[0];
  const isEmailLink =
    primaryEmail.includes("@") &&
    !primaryEmail.toLowerCase().includes("not yet available");

  return (
    <footer className="relative mt-auto">
      <div className="h-1 bg-linear-to-r from-gold via-gold-light to-gold" />

      <div className="text-white" style={{ backgroundColor: "#0E132B" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Landmark className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-bold leading-tight tracking-tight">
                    Sangguniang Bayan of {municipalityName}
                  </p>
                  <p className="text-xs text-white/50">
                    {municipalityLabel}, {provinceName}
                  </p>
                </div>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-white/60">
                Promoting transparency and good governance through accessible
                legislative records. Browse ordinances, resolutions, and session
                minutes of the Sangguniang Bayan of {municipalityName}.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Quick Links
              </h3>
              <nav className="flex flex-col gap-2.5">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Contact Us
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-white/60">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                  <span>
                    {displayInfo.officeAddressLines.map((line, index) => (
                      <span key={line}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-white/60">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                  <span>
                    {displayInfo.phoneLines.map((line, index) => (
                      <span key={line}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-white/60">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                  {isEmailLink ? (
                    <a
                      href={`mailto:${primaryEmail}`}
                      className="transition-colors hover:text-gold"
                    >
                      {displayInfo.emailLines.map((line, index) => (
                        <span key={line}>
                          {index > 0 ? <br /> : null}
                          {line}
                        </span>
                      ))}
                    </a>
                  ) : (
                    <span>
                      {displayInfo.emailLines.map((line, index) => (
                        <span key={line}>
                          {index > 0 ? <br /> : null}
                          {line}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-3 text-white/60">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                  <span>
                    {displayInfo.officeHoursLines.map((line, index) => (
                      <span key={line}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-5 text-center sm:px-6 lg:px-8">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} Sangguniang Bayan of{" "}
              {municipalityName}. All rights reserved.
            </p>
            <p className="mt-1.5 text-xs text-white/30">
              Powered by LegisArc | Legislative Archive Platform for Local
              Government Units
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
