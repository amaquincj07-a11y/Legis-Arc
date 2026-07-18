import type { Metadata } from "next";
import { Suspense } from "react";
import { MinutesDetailContent } from "../../../../minutes/[id]/minutes-detail-content";
import { formatPlaceName } from "@/lib/places";
import { lguPageMetadata, resolveLguParams } from "../../lgu-route";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string; municipality: string; id: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const place = await resolveLguParams(
    Promise.resolve({
      province: resolved.province,
      municipality: resolved.municipality,
    })
  );
  const name = formatPlaceName(place.municipality);
  return lguPageMetadata(
    Promise.resolve({
      province: resolved.province,
      municipality: resolved.municipality,
    }),
    {
      pathRest: `/minutes/${resolved.id}`,
      pageTitle: `Session Minutes — Sangguniang Bayan of ${name}`,
      pageDescription: `View session minutes PDF from the Sangguniang Bayan of ${name}.`,
    }
  );
}

function Fallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-10 w-48 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default async function LguMinutesDetailPage({
  params,
}: {
  params: Promise<{ province: string; municipality: string; id: string }>;
}) {
  const { id, province, municipality } = await params;
  await resolveLguParams(Promise.resolve({ province, municipality }));
  return (
    <Suspense fallback={<Fallback />}>
      <MinutesDetailContent id={id} />
    </Suspense>
  );
}
