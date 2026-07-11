"use client";

import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ScanDocumentInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  pdfFile: File | null;
  submitting: boolean;
  onSubmit: () => void;
  children: React.ReactNode;
};

export function ScanDocumentInfoDialog({
  open,
  onOpenChange,
  title,
  description,
  pdfFile,
  submitting,
  onSubmit,
  children,
}: ScanDocumentInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {pdfFile && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <FileText className="size-8 shrink-0 text-[#3998eb]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{pdfFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB scanned PDF
                </p>
              </div>
            </div>
          )}
          {children}
        </div>

        <DialogFooter className="border-t px-5 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={submitting || !pdfFile}>
            {submitting ? "Uploading..." : "Upload document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
