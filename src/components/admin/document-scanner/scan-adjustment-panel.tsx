"use client";

import { useState } from "react";
import { Check, Contrast, Sparkles, Sun, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ScanAdjustments } from "@/lib/document-scanner/types";

type AdjustmentTab = "contrast" | "brightness" | "details";

type ScanAdjustmentPanelProps = {
  adjustments: ScanAdjustments;
  onChange: (adjustments: ScanAdjustments) => void;
  onCancel: () => void;
  onApply: () => void;
};

const TABS: {
  id: AdjustmentTab;
  label: string;
  icon: typeof Contrast;
}[] = [
  { id: "contrast", label: "Contrast", icon: Contrast },
  { id: "brightness", label: "Brightness", icon: Sun },
  { id: "details", label: "Details", icon: Sparkles },
];

/** Maps internal -100..100 to display 0..100 (50 = neutral). */
export function toDisplayValue(internal: number): number {
  return Math.round((internal + 100) / 2);
}

/** Maps display 0..100 to internal -100..100. */
export function toInternalValue(display: number): number {
  return (display - 50) * 2;
}

export function ScanAdjustmentPanel({
  adjustments,
  onChange,
  onCancel,
  onApply,
}: ScanAdjustmentPanelProps) {
  const [activeTab, setActiveTab] = useState<AdjustmentTab>("contrast");

  const displayValue = toDisplayValue(adjustments[activeTab]);

  function setDisplayValue(value: number) {
    onChange({
      ...adjustments,
      [activeTab]: toInternalValue(value),
    });
  }

  return (
    <div className="bg-black pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
      <div className="flex items-center gap-4 px-6 py-5">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={displayValue}
          onChange={(event) => setDisplayValue(Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2dd4bf] [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#2dd4bf]"
          style={{
            background: `linear-gradient(to right, #2dd4bf 0%, #2dd4bf ${displayValue}%, rgba(255,255,255,0.18) ${displayValue}%, rgba(255,255,255,0.18) 100%)`,
          }}
        />
        <span className="w-8 shrink-0 text-right text-base font-medium text-white">
          {displayValue}
        </span>
      </div>

      <div className="flex items-end justify-between px-5 pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex size-11 items-center justify-center text-white/90 transition hover:text-white"
          aria-label="Cancel adjustments"
        >
          <X className="size-7 stroke-[2.5]" />
        </button>

        <div className="flex items-end gap-8 sm:gap-10">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-1.5"
              >
                <Icon
                  className={cn(
                    "size-7",
                    active ? "text-[#2dd4bf]" : "text-white/85"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    active ? "text-[#2dd4bf]" : "text-white/85"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onApply}
          className="flex size-11 items-center justify-center text-white/90 transition hover:text-white"
          aria-label="Apply adjustments"
        >
          <Check className="size-7 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
