import { notFound } from "next/navigation";
import { formatPlaceName } from "@/lib/places";
import {
  buildLguMetadata,
  resolvePlaceFromSlugs,
} from "@/lib/lgu-path";

export async function resolveLguParams(params: Promise<{
  province: string;
  municipality: string;
}>) {
  const { province: provinceSlug, municipality: municipalitySlug } =
    await params;
  const place = resolvePlaceFromSlugs(provinceSlug, municipalitySlug);
  if (!place) notFound();
  return place;
}

export async function lguPageMetadata(
  params: Promise<{ province: string; municipality: string }>,
  options?: {
    pathRest?: string;
    pageTitle?: string;
    pageDescription?: string;
  }
) {
  const place = await resolveLguParams(params);
  const municipalityName = formatPlaceName(place.municipality);

  return buildLguMetadata({
    ...place,
    pathRest: options?.pathRest,
    pageTitle: options?.pageTitle,
    pageDescription:
      options?.pageDescription ??
      `This Legislative Archive Platform provides public access to ordinances, resolutions, session minutes, and information about the Sangguniang Bayan of ${municipalityName}.`,
  });
}
