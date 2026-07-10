import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { generateSessionMinutesStaticParams } from "@/lib/supabase/generate-static-session-minutes-params";
import { MinutesDetailContent } from "./minutes-detail-content";

export async function generateStaticParams() {
  return generateSessionMinutesStaticParams();
}

function MinutesDetailFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading session minutes...</p>
    </div>
  );
}

export default async function MinutesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<MinutesDetailFallback />}>
      <MinutesDetailContent id={id} />
    </Suspense>
  );
}
