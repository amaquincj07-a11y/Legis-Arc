"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePlaceFilter } from "@/lib/place-filter-context";
import {
  formatPlaceName,
  getMunicipalities,
  getProvinces,
} from "@/lib/places";
import { cn } from "@/lib/utils";

const provinces = getProvinces();

type PlaceFilterTheme = "navy" | "header";

interface PlaceFilterSelectsProps {
  /** Larger labels and spacing for touch targets in sheets */
  variant?: "compact" | "comfortable";
  theme?: PlaceFilterTheme;
  className?: string;
}

export function PlaceFilterSelects({
  variant = "compact",
  theme = "navy",
  className,
}: PlaceFilterSelectsProps) {
  const { province, municipality, setProvince, setMunicipality } =
    usePlaceFilter();
  const municipalities = getMunicipalities(province);
  const comfortable = variant === "comfortable";
  const headerTheme = theme === "header";

  const selectTriggerClass = cn(
    "w-full font-medium",
    comfortable
      ? "h-11 border-gray-200 bg-white text-foreground hover:bg-gray-50"
      : headerTheme
        ? "h-9 min-w-[120px] border-navy/15 bg-white text-navy shadow-sm hover:border-gold/50 hover:bg-white focus-visible:ring-gold/40 sm:min-w-[140px] lg:min-w-[150px]"
        : "h-10 border-white/15 bg-white/10 text-white hover:bg-white/15 focus-visible:ring-gold/40 data-placeholder:text-white/60 [&_svg]:text-white/70"
  );

  return (
    <div
      className={cn(
        comfortable
          ? "grid gap-4"
          : headerTheme
            ? "flex items-center gap-2 sm:gap-2.5"
            : "grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3",
        className
      )}
    >
      <label
        className={cn(
          "min-w-0",
          headerTheme
            ? "w-[min(100%,140px)] sm:w-[150px] lg:w-[160px]"
            : !comfortable && "sm:min-w-[150px] sm:flex-1 sm:max-w-[220px]"
        )}
      >
        <span
          className={cn(
            "font-medium uppercase tracking-wide",
            comfortable
              ? "mb-2 block text-xs text-muted-foreground"
              : headerTheme
                ? "mb-1 block text-[10px] font-semibold text-navy/60 sm:text-[11px]"
                : "mb-1 block text-[11px] text-white/60 sm:sr-only"
          )}
        >
        </span>
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger
            size={comfortable ? "default" : "sm"}
            className={selectTriggerClass}
          >
            <SelectValue placeholder="Select province" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {provinces.map((item) => (
              <SelectItem key={item} value={item}>
                {formatPlaceName(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      {headerTheme && !comfortable ? (
        <div
          className="hidden h-8 w-px shrink-0 bg-navy/15 sm:block"
          aria-hidden
        />
      ) : null}

      <label
        className={cn(
          "min-w-0",
          headerTheme
            ? "w-[min(100%,150px)] sm:w-[165px] lg:w-[180px]"
            : !comfortable && "sm:min-w-[160px] sm:flex-1 sm:max-w-[240px]"
        )}
      >
        <span
          className={cn(
            "font-medium uppercase tracking-wide",
            comfortable
              ? "mb-2 block text-xs text-muted-foreground"
              : headerTheme
                ? "mb-1 block text-[10px] font-semibold text-navy/60 sm:text-[11px]"
                : "mb-1 block text-[11px] text-white/60 sm:sr-only"
          )}
        >
        </span>
        <Select
          value={municipality}
          onValueChange={setMunicipality}
          disabled={municipalities.length === 0}
        >
          <SelectTrigger
            size={comfortable ? "default" : "sm"}
            className={selectTriggerClass}
          >
            <SelectValue placeholder="Select municipality" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {municipalities.map((item) => (
              <SelectItem key={item} value={item}>
                {formatPlaceName(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}

interface PlaceFilterBarProps {
  className?: string;
  theme?: PlaceFilterTheme;
}

/** Inline location picker for header (tablet and desktop) */
export function PlaceFilterBar({
  className,
  theme = "navy",
}: PlaceFilterBarProps) {
  const headerTheme = theme === "header";

  return (
    <div
      className={cn(
        headerTheme ? "hidden sm:flex" : "hidden md:flex",
        "items-center gap-3",
        headerTheme
          ? "rounded-xl border border-navy/10 bg-linear-to-r from-slate-50 to-white px-3 py-2 shadow-sm ring-1 ring-navy/5 sm:px-4"
          : "rounded-lg border border-white/10 bg-navy/95 px-4 py-2 text-white shadow-sm md:flex-wrap",
        className
      )}
      role="group"
      aria-label="Location filter"
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-1.5 border-r pr-3 sm:gap-2 sm:pr-4",
          headerTheme ? "border-navy/10" : "border-white/15"
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            headerTheme ? "bg-gold/15 text-gold" : "text-gold"
          )}
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        </span>
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wider",
            headerTheme ? "text-navy" : "text-gold"
          )}
        >
          Select Location
        </span>
      </div>
      <PlaceFilterSelects theme={theme} className="min-w-0" />
    </div>
  );
}

/** Compact one-line trigger + bottom sheet for phones */
export function PlaceFilterMobileTrigger({
  className,
  theme = "navy",
}: PlaceFilterBarProps) {
  const [open, setOpen] = useState(false);
  const { shortLocationLabel } = usePlaceFilter();
  const headerTheme = theme === "header";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 min-w-0 max-w-46 items-center gap-2 rounded-full border px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 sm:hidden",
            headerTheme
              ? "border-navy/10 bg-linear-to-r from-slate-50 to-white text-navy shadow-sm ring-1 ring-navy/5 hover:border-gold/40 hover:bg-white"
              : "h-11 w-full rounded-md px-3 text-white hover:bg-white/10",
            className
          )}
          aria-label={`Select location. Current: ${shortLocationLabel}`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold text-navy">
            {shortLocationLabel}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0",
              headerTheme ? "text-navy/50" : "text-white/70"
            )}
            aria-hidden
          />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-2">
        <SheetHeader className="border-b border-gray-100 pb-4 text-left">
          <SheetTitle className="text-base font-semibold text-navy">
            Select Location
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Choose a province and municipality to view its Sangguniang Bayan records.
          </p>
        </SheetHeader>
        <div className="mt-4">
          <PlaceFilterSelects variant="comfortable" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
