import { Globe, GlobeLock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getVisibilityMeta } from "@/lib/admin-document-visibility";
import type { DocumentStatus } from "@/lib/types";

type PublicVisibilityBadgeProps = {
  status: DocumentStatus;
  isPublic: boolean;
  className?: string;
};

export function PublicVisibilityBadge({
  status,
  isPublic,
  className,
}: PublicVisibilityBadgeProps) {
  const { published, label } = getVisibilityMeta({ status, isPublic });
  const Icon = published ? Globe : GlobeLock;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border px-2 py-0.5 text-[11px] font-medium",
        published
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
        className
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {label}
    </Badge>
  );
}
