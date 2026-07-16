import { Suspense } from "react";
import { ResolutionsContent } from "./resolutions-content";

function ResolutionsFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="h-10 w-full max-w-md rounded-md bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function ResolutionsPage() {
  return (
    <Suspense fallback={<ResolutionsFallback />}>
      <ResolutionsContent />
    </Suspense>
  );
}
