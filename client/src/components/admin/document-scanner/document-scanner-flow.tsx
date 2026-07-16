"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CameraCaptureStep } from "@/components/admin/document-scanner/camera-capture-step";
import { ScanEditStep } from "@/components/admin/document-scanner/scan-edit-step";
import { ScanPagesStep } from "@/components/admin/document-scanner/scan-pages-step";
import { buildPdfFromScanPages } from "@/lib/document-scanner/pdf-builder";
import {
  createScanPage,
  type ScanPage,
  type ScannerStep,
} from "@/lib/document-scanner/types";

type DocumentScannerFlowProps = {
  backHref: string;
  pdfFileName: string;
  infoDialog: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfFile: File | null;
    submitting: boolean;
    onSubmit: () => void;
  }) => React.ReactNode;
  onBuildPdf: (pages: ScanPage[]) => Promise<File>;
  onUpload: (pdfFile: File) => Promise<boolean>;
};

export function DocumentScannerFlow({
  backHref,
  pdfFileName,
  infoDialog,
  onBuildPdf,
  onUpload,
}: DocumentScannerFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<ScannerStep>("camera");
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [draftPage, setDraftPage] = useState<ScanPage | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addingFromPages, setAddingFromPages] = useState(false);

  function handleCapture(dataUrl: string) {
    setDraftPage(createScanPage(dataUrl));
    setStep("edit");
  }

  function handleAddPage() {
    if (!draftPage) return;
    setPages((current) => [...current, draftPage]);
    setDraftPage(null);
    setStep("pages");
  }

  async function handleUploadClick() {
    if (pages.length === 0) {
      toast.error("Add at least one scanned page");
      return;
    }

    try {
      const file = await onBuildPdf(pages);
      setPdfFile(file);
      setInfoOpen(true);
    } catch {
      toast.error("Unable to build PDF from scanned pages");
    }
  }

  async function handleFinalSubmit() {
    if (!pdfFile) return;
    setSubmitting(true);
    const success = await onUpload(pdfFile);
    setSubmitting(false);
    if (success) {
      setInfoOpen(false);
      router.push(backHref);
    }
  }

  if (step === "camera") {
    return (
      <>
        <CameraCaptureStep
          onBack={() => {
            if (addingFromPages) {
              setAddingFromPages(false);
              setStep("pages");
              return;
            }
            router.push(backHref);
          }}
          onCapture={handleCapture}
        />
        {infoDialog({
          open: infoOpen,
          onOpenChange: setInfoOpen,
          pdfFile,
          submitting,
          onSubmit: handleFinalSubmit,
        })}
      </>
    );
  }

  if (step === "edit" && draftPage) {
    return (
      <>
        <ScanEditStep
          page={draftPage}
          onChange={setDraftPage}
          onBack={() => {
            setDraftPage(null);
            setStep(pages.length > 0 ? "pages" : "camera");
          }}
          onRetake={() => {
            setDraftPage(null);
            setStep("camera");
          }}
          onAdd={handleAddPage}
        />
        {infoDialog({
          open: infoOpen,
          onOpenChange: setInfoOpen,
          pdfFile,
          submitting,
          onSubmit: handleFinalSubmit,
        })}
      </>
    );
  }

  return (
    <>
      <ScanPagesStep
        pages={pages}
        onBack={() => router.push(backHref)}
        onAddPicture={() => {
          setAddingFromPages(true);
          setStep("camera");
        }}
        onUpload={handleUploadClick}
      />
      {infoDialog({
        open: infoOpen,
        onOpenChange: setInfoOpen,
        pdfFile,
        submitting,
        onSubmit: handleFinalSubmit,
      })}
    </>
  );
}

export function defaultBuildPdf(pages: ScanPage[], fileName: string) {
  return buildPdfFromScanPages(pages, fileName);
}
