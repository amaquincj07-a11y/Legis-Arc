"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UploadModeDialog } from "@/components/admin/document-scanner/upload-mode-dialog";

type AdminUploadTriggerProps = {
  label?: string;
  documentLabel: string;
  uploadHref: string;
  scanHref: string;
  icon?: LucideIcon;
};

export function AdminUploadTrigger({
  label = "Upload New",
  documentLabel,
  uploadHref,
  scanHref,
  icon: Icon = Plus,
}: AdminUploadTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 w-full gap-2 rounded-full bg-[#cbab53] px-5 text-[13px] font-semibold text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745] hover:shadow-lg hover:shadow-[#cbab53]/40 sm:h-10 sm:w-auto"
      >
        <Icon className="size-4" />
        {label}
      </Button>

      <UploadModeDialog
        open={open}
        onOpenChange={setOpen}
        documentLabel={documentLabel}
        uploadHref={uploadHref}
        scanHref={scanHref}
      />
    </>
  );
}
