"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminFormPageHeaderProps = {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Back arrow + title on the left; primary form actions (Cancel / Save) on the right,
 * vertically aligned with the arrow control.
 */
export function AdminFormPageHeader({
  backHref,
  backLabel = "Back",
  title,
  description,
  actions,
  className,
}: AdminFormPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          asChild
        >
          <Link href={backHref} aria-label={backLabel}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
