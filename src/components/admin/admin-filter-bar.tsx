"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  children?: React.ReactNode;
};

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  hasActiveFilters = false,
  onClearFilters,
  children,
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm shadow-sm focus-visible:ring-[#3998eb] sm:h-9"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
        {hasActiveFilters && onClearFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-10 gap-1.5 rounded-full px-3 text-xs font-medium text-slate-500 hover:text-slate-800 sm:h-9"
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
