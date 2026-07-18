import type { Metadata } from "next";
import { Suspense } from "react";
import { CSOContent } from "../../../cso/cso-content";
import { formatPlaceName } from "@/lib/places";
import { lguPageMetadata, resolveLguParams } from "../lgu-route";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string; municipality: string }>;
}): Promise<Metadata> {
  const place = await resolveLguParams(params);
  const name = formatPlaceName(place.municipality);
  return lguPageMetadata(params, {
    pathRest: "/cso",
    pageTitle: `CSO — Sangguniang Bayan of ${name}`,
    pageDescription: `Accredited Civil Society Organizations registered with the Sangguniang Bayan of ${name}.`,
  });
}

function Fallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-10 w-48 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default async function LguCsoPage({
  params,
}: {
  params: Promise<{ province: string; municipality: string }>;
}) {
  await resolveLguParams(params);
  return (
    <Suspense fallback={<Fallback />}>
      <CSOContent />
    </Suspense>
  );
}
