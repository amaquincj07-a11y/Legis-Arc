"use client";

import Link from "next/link";
import { Camera, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UploadModeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadHref: string;
  scanHref: string;
  documentLabel: string;
};

export function UploadModeDialog({
  open,
  onOpenChange,
  uploadHref,
  scanHref,
  documentLabel,
}: UploadModeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle>Add {documentLabel}</DialogTitle>
          <DialogDescription>
            Scan a paper document with your camera or upload an existing PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <Button
            asChild
            variant="outline"
            className="h-auto min-h-32 flex-col gap-3 rounded-2xl border-slate-200 px-4 py-5 text-left hover:border-[#3998eb]/40 hover:bg-[#3998eb]/5"
            onClick={() => onOpenChange(false)}
          >
            <Link href={scanHref}>
              <span className="flex size-12 items-center justify-center rounded-full bg-[#101B29] text-white">
                <Camera className="size-5" />
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-slate-900">
                  Scan document
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Use your camera, apply filters, and build a PDF
                </span>
              </span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto min-h-32 flex-col gap-3 rounded-2xl border-slate-200 px-4 py-5 text-left hover:border-[#cbab53]/50 hover:bg-[#cbab53]/10"
            onClick={() => onOpenChange(false)}
          >
            <Link href={uploadHref}>
              <span className="flex size-12 items-center justify-center rounded-full bg-[#cbab53] text-slate-900">
                <Upload className="size-5" />
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-slate-900">
                  Upload PDF
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  Use the current upload form for an existing PDF file
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
