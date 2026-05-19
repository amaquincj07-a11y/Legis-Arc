"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AdminActionItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  hidden?: boolean;
  separatorBefore?: boolean;
};

type AdminActionsMenuProps = {
  items: AdminActionItem[];
  align?: "start" | "end";
};

export function AdminActionsMenu({
  items,
  align = "end",
}: AdminActionsMenuProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-full border-slate-200 px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`${item.label}-${index}`}>
              {item.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={cn(
                  "gap-2 cursor-pointer text-sm",
                  item.destructive &&
                    "text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                )}
                onClick={item.onClick}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
