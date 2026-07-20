"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  setPendingUpload,
  validatePdfFile,
  type PendingUploadKind,
} from "@/lib/pending-upload";
import { cn } from "@/lib/utils";

type AdminUploadTriggerProps = {
  label?: string;
  /** Form page to open after a PDF is chosen */
  uploadHref: string;
  kind: PendingUploadKind;
  icon?: LucideIcon;
  className?: string;
  variant?: "default" | "outline";
};

/**
 * Opens the system file picker first. After a valid PDF is selected,
 * navigates to the upload form with that file ready for preview.
 */
export function AdminUploadTrigger({
  label = "Upload New",
  uploadHref,
  kind,
  icon: Icon = Plus,
  className,
  variant = "default",
}: AdminUploadTriggerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const result = validatePdfFile(file);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setPendingUpload(kind, result.file);
    router.push(uploadHref);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant={variant === "outline" ? "outline" : "default"}
        onClick={handleClick}
        className={cn(
          variant === "default" &&
            "h-11 w-full gap-2 rounded-full bg-[#cbab53] px-5 text-[13px] font-semibold text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745] hover:shadow-lg hover:shadow-[#cbab53]/40 sm:h-10 sm:w-auto",
          variant === "outline" && "mt-4 gap-2",
          className
        )}
      >
        <Icon className="size-4" />
        {label}
      </Button>
    </>
  );
}
