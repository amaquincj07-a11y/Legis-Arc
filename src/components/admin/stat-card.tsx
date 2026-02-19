import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href: string;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  href,
  description,
  className,
}: Readonly<StatCardProps>) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <Card className="gap-0 py-5 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="truncate text-sm text-muted-foreground">{title}</p>
          </div>
        </CardContent>
        {description && (
          <div className="px-6 pt-1">
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        )}
      </Card>
    </Link>
  );
}
