import { Suspense } from "react";
import { SearchContent } from "./search-content";

function SearchFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="h-10 w-full max-w-md rounded-md bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
