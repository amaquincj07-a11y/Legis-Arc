import type { Metadata } from "next";
import HomePage from "../../home/page";
import { formatPlaceName } from "@/lib/places";
import { getSiteUrl, buildLguPath } from "@/lib/lgu-path";
import { lguPageMetadata, resolveLguParams } from "./lgu-route";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string; municipality: string }>;
}): Promise<Metadata> {
  const place = await resolveLguParams(params);
  const name = formatPlaceName(place.municipality);
  return lguPageMetadata(params, {
    pageTitle: `Sangguniang Bayan ng ${name} - Legislative Records`,
    pageDescription: `This Legislative Archive Platform provides public access to ordinances, resolutions, session minutes, and information about the Sangguniang Bayan of ${name}.`,
  });
}

export default async function LguHomePage({
  params,
}: {
  params: Promise<{ province: string; municipality: string }>;
}) {
  const place = await resolveLguParams(params);
  const name = formatPlaceName(place.municipality);
  const url = `${getSiteUrl()}${buildLguPath(place.province, place.municipality)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: `Sangguniang Bayan of ${name}`,
    description: `Public legislative records for the Sangguniang Bayan of ${name}, including ordinances, resolutions, and session minutes.`,
    areaServed: name,
    url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}
