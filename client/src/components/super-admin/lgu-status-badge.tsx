import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LGUClientStatus } from "@/lib/types";

const statusConfig: Record<
  LGUClientStatus,
  { label: string; className: string }
> = {
  trial: {
    label: "Trial",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  active: {
    label: "Active",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  expired: {
    label: "Expired",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  suspended: {
    label: "Blocked",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export function LGUStatusBadge({
  status,
  className,
}: Readonly<{
  status: LGUClientStatus;
  className?: string;
}>) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
