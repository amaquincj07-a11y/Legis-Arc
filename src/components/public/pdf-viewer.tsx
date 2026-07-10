"use client";

import { useState, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentDownloadDialog } from "@/components/public/document-download-dialog";
import type { PublicDocumentDownloadContext } from "@/lib/types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
  downloadContext?: PublicDocumentDownloadContext;
}

export function PdfViewer({ pdfUrl, title, downloadContext }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showCertifiedDialog, setShowCertifiedDialog] = useState(false);
  const [showCertifiedInstructions, setShowCertifiedInstructions] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [office, setOffice] = useState("");
  const [purpose, setPurpose] = useState("");
  const [purposeError, setPurposeError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [officeError, setOfficeError] = useState("");

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    setLoading(false);
  }, []);

  const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));
  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages],
  );

  function validateCertifiedForm() {
    let valid = true;
    if (!name.trim()) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setEmailError("Invalid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!office.trim()) {
      setOfficeError("Office/Department/Establishment/Address is required.");
      valid = false;
    } else {
      setOfficeError("");
    }
    if (!purpose.trim()) {
      setPurposeError("Purpose is required.");
      valid = false;
    } else {
      setPurposeError("");
    }
    return valid;
  }

  function resetCertifiedForm() {
    setName("");
    setEmail("");
    setOffice("");
    setPurpose("");
    setNameError("");
    setEmailError("");
    setOfficeError("");
    setPurposeError("");
  }

  function handleCertifiedRequest() {
    if (!validateCertifiedForm()) return;
    setShowCertifiedInstructions(true);
  }

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-white"
          : "flex flex-col"
      }
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {numPages > 0 ? `${numPages} page${numPages > 1 ? "s" : ""}` : "—"}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            aria-label="Download PDF"
            onClick={() => setShowDownloadDialog(true)}
            disabled={!downloadContext}
          >
            <Download className="mr-1 h-4 w-4" />
            <span className="text-sm font-medium">Download File</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2 flex items-center"
            onClick={() => {
              setShowCertifiedDialog(true);
              resetCertifiedForm();
              setShowCertifiedInstructions(false);
            }}
          >
            <Stamp className="mr-1 h-4 w-4" />
            Request Certified Copy
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-12 text-center text-xs font-medium text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} disabled={scale >= 2.5}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {downloadContext ? (
        <DocumentDownloadDialog
          open={showDownloadDialog}
          onOpenChange={setShowDownloadDialog}
          downloadContext={downloadContext}
          downloadFileName={title}
        />
      ) : null}

      {showCertifiedDialog && !showCertifiedInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="flex w-full max-w-xs flex-col gap-4 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-base font-semibold">Request Certified Copy</h2>
            <Input
              autoFocus
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              aria-label="Name"
            />
            {nameError && <span className="text-xs text-red-600">{nameError}</span>}
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              aria-label="Email"
              type="email"
            />
            {emailError && <span className="text-xs text-red-600">{emailError}</span>}
            <Input
              placeholder="Office / Department / Establishment / Address"
              value={office}
              onChange={(e) => {
                setOffice(e.target.value);
                setOfficeError("");
              }}
              aria-label="Office / Department / Establishment / Address"
            />
            {officeError && <span className="text-xs text-red-600">{officeError}</span>}
            <Input
              placeholder="Purpose"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setPurposeError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCertifiedRequest();
              }}
              aria-label="Purpose"
            />
            {purposeError && <span className="text-xs text-red-600">{purposeError}</span>}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCertifiedDialog(false);
                  resetCertifiedForm();
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCertifiedRequest}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCertifiedDialog && showCertifiedInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-center text-base font-semibold">
              Request for Certified Copy
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              Please proceed to the Treasurer&apos;s Office to pay the required fee.
              <br />
              <br />
              Then, proceed to the Sangguniang Bayan Office located at the Municipal
              Building, Poblacion, Panglao, Bohol 6340 to get your certified copy.
            </p>
            <Button
              className="mt-2"
              onClick={() => {
                setShowCertifiedDialog(false);
                setShowCertifiedInstructions(false);
                resetCertifiedForm();
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <div
        className={
          isFullscreen
            ? "flex-1 overflow-auto bg-gray-100"
            : "overflow-auto bg-gray-100"
        }
        style={isFullscreen ? undefined : { maxHeight: "75vh" }}
      >
        <div
          className="flex select-none flex-col items-center gap-4 py-4"
          style={{ userSelect: "none" }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-[#3998eb]" />
                  <p className="text-sm text-muted-foreground">Loading document...</p>
                </div>
              </div>
            }
            error={
              <div className="flex h-96 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Unable to load document. Please try again later.
                </p>
              </div>
            }
          >
            {pageNumbers.map((page) => (
              <Page
                key={page}
                pageNumber={page}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md"
                loading={
                  <div className="flex h-96 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-[#3998eb]" />
                  </div>
                }
              />
            ))}
          </Document>
        </div>
      </div>

      {title && (
        <div className="border-t bg-muted/30 px-3 py-2">
          <p className="truncate text-center text-xs text-muted-foreground">{title}</p>
        </div>
      )}
    </div>
  );
}
