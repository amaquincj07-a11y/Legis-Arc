import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/lib/types";

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "secondary" | "outline" | "default" | "destructive"; className?: string }
> = {
  draft: { variant: "secondary", label: "Draft" },
  approved: {
    variant: "outline",
    label: "Approved",
    className: "border-blue-300 bg-blue-50 text-blue-700",
  },
  published: {
    variant: "default",
    label: "Published",
    className: "border-transparent bg-emerald-100 text-emerald-700",
  },
  archived: { variant: "destructive", label: "Archived" },
};

export function StatusBadge({
  status,
  className,
}: Readonly<{
  status: DocumentStatus;
  className?: string;
}>) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
