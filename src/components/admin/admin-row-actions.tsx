"use client";

import { cn } from "@/lib/utils";
import { AdminIconAction } from "@/components/admin/admin-icon-action";
import type { AdminActionItem } from "@/components/admin/admin-actions-menu";

type ActionVariant = "default" | "primary" | "accent" | "danger" | "success";

function variantForItem(item: AdminActionItem): ActionVariant {
  if (item.destructive) return "danger";
  const label = item.label.toLowerCase();
  if (label.includes("edit")) return "primary";
  if (label.includes("publish")) return "success";
  if (label.includes("download") || label.includes("view")) return "accent";
  return "default";
}

type AdminRowActionsProps = {
  items: AdminActionItem[];
  className?: string;
};

export function AdminRowActions({ items, className }: AdminRowActionsProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-nowrap items-center gap-1.5 lg:justify-center",
        className
      )}
    >
      {visibleItems.map((item, index) => (
        <AdminIconAction
          key={`${item.label}-${index}`}
          label={item.label}
          icon={item.icon}
          onClick={item.onClick}
          variant={variantForItem(item)}
        />
      ))}
    </div>
  );
}
