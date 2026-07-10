"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type EditPdfDocumentFieldProps = {
  existingFileName: string;
  hasExistingDocument?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
};

function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function EditPdfDocumentField({
  existingFileName,
  hasExistingDocument = true,
  value,
  onChange,
  className,
}: EditPdfDocumentFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 25MB");
      return;
    }

    onChange(file);
    setIsReplacing(false);
  }

  function clearNewFile() {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (hasExistingDocument) {
      setIsReplacing(false);
    }
  }

  function startReplace() {
    setIsReplacing(true);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function cancelReplace() {
    setIsReplacing(false);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const showExistingDocument =
    hasExistingDocument && !value && !isReplacing;

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#3998eb]/30 bg-[#3998eb]/5 p-4">
          <FileText className="size-8 shrink-0 text-[#3998eb]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              New file · {formatFileSize(value.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove new PDF"
            onClick={clearNewFile}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : showExistingDocument ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
            <FileText className="size-8 shrink-0 text-destructive/80" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{existingFileName}</p>
              <p className="text-xs text-muted-foreground">Current document</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove current document to upload a new one"
              onClick={startReplace}
            >
              <X className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The current PDF is kept when you save. Remove it only if you want to
            upload a replacement.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {hasExistingDocument && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Upload a new PDF to replace the current document.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2 text-xs"
                onClick={cancelReplace}
              >
                Keep current file
              </Button>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
          >
            <Upload className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {hasExistingDocument
                  ? "Click to upload replacement PDF"
                  : "Click to upload PDF"}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF only, max 25MB
              </p>
            </div>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
