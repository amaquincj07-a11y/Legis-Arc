import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { generateResolutionStaticParams } from "@/lib/generate-static-params";
import { ResolutionDetailContent } from "./resolution-detail-content";

export async function generateStaticParams() {
  return generateResolutionStaticParams();
}

function ResolutionDetailFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading resolution...</p>
    </div>
  );
}

export default async function ResolutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<ResolutionDetailFallback />}>
      <ResolutionDetailContent id={id} />
    </Suspense>
  );
}
