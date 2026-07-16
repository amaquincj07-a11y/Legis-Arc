"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

type PasswordRevealProps = {
  value: string | null | undefined;
  emptyLabel?: string;
  className?: string;
};

function PasswordReveal({
  value,
  emptyLabel = "Not on file",
  className,
}: PasswordRevealProps) {
  const [visible, setVisible] = React.useState(false);
  const hasValue = Boolean(value && value.length > 0);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-mono text-sm",
          hasValue ? "text-slate-900" : "text-muted-foreground"
        )}
      >
        {hasValue ? (visible ? value : "•".repeat(Math.min(value!.length, 12))) : emptyLabel}
      </span>
      {hasValue ? (
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}

export { PasswordReveal };
