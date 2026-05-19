"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ActionVariant = "default" | "primary" | "accent" | "danger" | "success";

const variantStyles: Record<ActionVariant, string> = {
  default:
    "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
  primary:
    "border-slate-200 bg-white text-slate-500 hover:border-[#3998eb]/80 hover:text-[#3998eb]",
  accent:
    "border-slate-200 bg-white text-slate-500 hover:border-[#cbab53]/80 hover:text-[#cbab53]",
  danger:
    "border-slate-200 bg-white text-slate-500 hover:border-rose-300/90 hover:text-rose-600",
  success:
    "border-slate-200 bg-white text-slate-500 hover:border-emerald-300/90 hover:text-emerald-600",
};

type AdminIconActionProps = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: ActionVariant;
  disabled?: boolean;
};

export function AdminIconAction({
  label,
  icon: Icon,
  onClick,
  variant = "default",
  disabled = false,
}: AdminIconActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "group relative flex size-8 shrink-0 items-center justify-center rounded-full border shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40",
        variantStyles[variant]
      )}
      onClick={onClick}
    >
      <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100 sm:block">
        {label}
      </span>
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
