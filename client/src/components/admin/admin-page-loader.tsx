import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageLoader() {
  return (
    <Loader2
      className="size-8 animate-spin text-[#3998eb]"
      aria-label="Loading"
      role="status"
    />
  );
}

export function AdminPageLoaderCentered({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] items-center justify-center",
        className
      )}
    >
      <AdminPageLoader />
    </div>
  );
}
