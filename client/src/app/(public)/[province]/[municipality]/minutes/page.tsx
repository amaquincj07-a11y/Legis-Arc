import type { Metadata } from "next";
import { Suspense } from "react";
import { MinutesContent } from "../../../minutes/minutes-content";
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
    pathRest: "/minutes",
    pageTitle: `Session Minutes in ${name} | Sangguniang Bayan Records`,
    pageDescription: `Browse public session minutes of the Sangguniang Bayan of ${name}. View proceedings by year and session on LegisArc.`,
  });
}

function Fallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex w-full max-w-md animate-pulse flex-col items-center gap-3">
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}

export default async function LguMinutesPage({
  params,
}: {
  params: Promise<{ province: string; municipality: string }>;
}) {
  await resolveLguParams(params);
  return (
    <Suspense fallback={<Fallback />}>
      <MinutesContent />
    </Suspense>
  );
}
