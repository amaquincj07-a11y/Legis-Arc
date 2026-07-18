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
import { PdfFileIcon } from "@/components/admin/pdf-file-icon";
import { cn } from "@/lib/utils";

export type AdminActionItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  hidden?: boolean;
  separatorBefore?: boolean;
  accent?: "publish" | "unpublish";
};

type AdminActionsMenuProps = {
  items: AdminActionItem[];
  align?: "start" | "end";
  /** `pdf` = document-style trigger for ordinance/resolution lists */
  trigger?: "default" | "pdf";
};

export function AdminActionsMenu({
  items,
  align = "end",
  trigger = "default",
}: AdminActionsMenuProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger === "pdf" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-lg p-0 hover:bg-slate-100/80 sm:size-10 [&_svg]:size-auto"
            aria-label="Document actions"
          >
            <PdfFileIcon className="size-10 sm:size-9" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 min-w-10 gap-1.5 rounded-full border-slate-200 px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:h-8 sm:min-w-0"
            aria-label="Row actions"
          >
            <MoreHorizontal className="size-4" />
            <span className="hidden sm:inline">Actions</span>
          </Button>
        )}
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
                    "text-rose-600 focus:bg-rose-50 focus:text-rose-600",
                  item.accent === "publish" &&
                    "text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700",
                  item.accent === "unpublish" &&
                    "text-amber-700 focus:bg-amber-50 focus:text-amber-700"
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
