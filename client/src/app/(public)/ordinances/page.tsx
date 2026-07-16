import { Suspense } from "react";
import { OrdinancesContent } from "./ordinances-content";

function OrdinancesFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="h-10 w-full max-w-md rounded-md bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function OrdinancesPage() {
  return (
    <Suspense fallback={<OrdinancesFallback />}>
      <OrdinancesContent />
    </Suspense>
  );
}
