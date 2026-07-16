import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { generateOrdinanceStaticParams } from "@/lib/generate-static-params";
import { OrdinanceDetailContent } from "./ordinance-detail-content";

export async function generateStaticParams() {
  return generateOrdinanceStaticParams();
}

function OrdinanceDetailFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading ordinance...</p>
    </div>
  );
}

export default async function OrdinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<OrdinanceDetailFallback />}>
      <OrdinanceDetailContent id={id} />
    </Suspense>
  );
}
