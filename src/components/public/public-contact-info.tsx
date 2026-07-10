"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { usePlaceFilter } from "@/lib/place-filter-context";
import {
  fetchPublicLGUContactInfoAction,
  type PublicLGUContactInfo,
} from "@/lib/public-contact-actions";

function ContactInfoBlock({
  icon: Icon,
  title,
  lines,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
}>) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/10">
          <Icon className="h-4 w-4 text-navy" />
        </div>
        <h3 className="font-[family-name:var(--font-garamond)] text-sm font-semibold uppercase tracking-wide text-navy sm:text-base">
          {title}
        </h3>
      </div>
      <div className="space-y-0.5 pl-10">
        {lines.map((line) => (
          <p
            key={line}
            className="font-[family-name:var(--font-garamond)] text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export function PublicContactInfo() {
  const { province, municipality, municipalityName, provinceName } =
    usePlaceFilter();
  const [contactInfo, setContactInfo] = useState<PublicLGUContactInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContactInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchPublicLGUContactInfoAction(
      province,
      municipality
    );

    if (!result.success) {
      setContactInfo(null);
      setError(result.error);
    } else {
      setContactInfo(result.data);
    }

    setLoading(false);
  }, [province, municipality]);

  useEffect(() => {
    void loadContactInfo();
  }, [loadContactInfo]);

  const displayInfo: PublicLGUContactInfo = contactInfo ?? {
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
  };

  return (
    <section className="bg-muted/30 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Contact Information
          </h2>
          <p className="font-[family-name:var(--font-garamond)] mt-2 text-sm text-muted-foreground sm:text-base">
            Get in touch with the Office of the Sangguniang Bayan of{" "}
            {municipalityName}, {provinceName}
          </p>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading contact information...</span>
            </div>
          ) : (
            <>
              {error ? (
                <p className="mb-4 text-center text-sm text-amber-700">
                  {error}
                </p>
              ) : null}
              {!contactInfo && !error ? (
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  No registered LGU contact record found for this location yet.
                  Showing default office hours below.
                </p>
              ) : null}

              <div className="grid gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-4">
                <ContactInfoBlock
                  icon={MapPin}
                  title="Office Address"
                  lines={displayInfo.officeAddressLines}
                />
                <ContactInfoBlock
                  icon={Phone}
                  title="Phone"
                  lines={displayInfo.phoneLines}
                />
                <ContactInfoBlock
                  icon={Mail}
                  title="Email"
                  lines={displayInfo.emailLines}
                />
                <ContactInfoBlock
                  icon={Clock}
                  title="Office Hours"
                  lines={displayInfo.officeHoursLines}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
