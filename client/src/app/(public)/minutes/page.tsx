import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MinutesContent } from "./minutes-content";

function MinutesFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading session minutes...</p>
    </div>
  );
}

export default function MinutesPage() {
  return (
    <Suspense fallback={<MinutesFallback />}>
      <MinutesContent />
    </Suspense>
  );
}
