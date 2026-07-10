"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminPageHeaderAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
};

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: AdminPageHeaderAction;
  children?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  action,
  children,
}: AdminPageHeaderProps) {
  const ActionIcon = action?.icon;

  const actionButton = action ? (
    <Button
      asChild={Boolean(action.href)}
      onClick={action.onClick}
      className="h-11 w-full gap-2 rounded-full bg-[#cbab53] px-5 text-[13px] font-semibold text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745] hover:shadow-lg hover:shadow-[#cbab53]/40 sm:h-10 sm:w-auto"
    >
      {action.href ? (
        <Link href={action.href}>
          {ActionIcon && <ActionIcon className="size-4" />}
          {action.label}
        </Link>
      ) : (
        <>
          {ActionIcon && <ActionIcon className="size-4" />}
          {action.label}
        </>
      )}
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[26px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children ?? actionButton}
    </div>
  );
}
