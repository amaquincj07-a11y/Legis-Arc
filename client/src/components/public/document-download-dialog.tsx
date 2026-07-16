"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPublicDocumentDownloadUrlAction,
  recordPublicDocumentDownloadAction,
} from "@/lib/document-download-actions";
import type { PublicDocumentDownloadContext } from "@/lib/types";

interface DocumentDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  downloadContext: PublicDocumentDownloadContext;
  downloadFileName?: string;
}

function PrivacyNoticeContent({
  municipalityLabel,
}: {
  municipalityLabel: string;
}) {
  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm text-muted-foreground">
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Privacy Notice</h3>
        <p>
          The information you provide is collected by the Sangguniang Bayan
          {municipalityLabel ? ` of ${municipalityLabel}` : ""} solely for the
          purpose of recording access to legislative documents, generating usage
          statistics, and improving public access to legislative records.
        </p>
        <p>The collected information may include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name (if provided)</li>
          <li>Office, Organization, or Establishment</li>
          <li>Purpose of document access</li>
          <li>Date and time of access</li>
          <li>Requested document</li>
        </ul>
        <p>
          Your personal information will be processed in accordance with the Data
          Privacy Act of 2012 (Republic Act No. 10173) and will not be used for
          marketing or disclosed to unauthorized parties unless required by law.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Terms of Use</h3>
        <p>By downloading this document, you acknowledge and agree that:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            The downloaded document is intended for lawful, official, educational,
            research, or informational purposes.
          </li>
          <li>
            You are responsible for ensuring the proper use of the downloaded
            document.
          </li>
          <li>
            Downloading a document does not constitute the issuance of a Certified
            True Copy.
          </li>
          <li>
            If a Certified True Copy is required for legal or official proceedings,
            you must request it directly from the Sangguniang Bayan and comply
            with its applicable procedures and fees.
          </li>
          <li>
            The Sangguniang Bayan reserves the right to maintain records of
            document access for administrative and statistical purposes.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Consent</h3>
        <p>By selecting &quot;I Agree&quot;, you confirm that:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            You have read and understood this Privacy Notice and Terms of Use.
          </li>
          <li>You voluntarily provide the requested information.</li>
          <li>
            You consent to the collection and processing of your information for
            the purposes stated above.
          </li>
        </ul>
      </section>
    </div>
  );
}

export function DocumentDownloadDialog({
  open,
  onOpenChange,
  downloadContext,
  downloadFileName,
}: DocumentDownloadDialogProps) {
  const [name, setName] = useState("");
  const [office, setOffice] = useState("");
  const [purpose, setPurpose] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [officeError, setOfficeError] = useState("");
  const [purposeError, setPurposeError] = useState("");
  const [consentError, setConsentError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const municipalityLabel =
    downloadContext.municipalityLabel?.replace(/^Municipality of /i, "") ?? "";

  function resetForm() {
    setName("");
    setOffice("");
    setPurpose("");
    setConsentAgreed(false);
    setOfficeError("");
    setPurposeError("");
    setConsentError("");
    setSubmitError("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
      setShowPrivacyDialog(false);
    }
    onOpenChange(nextOpen);
  }

  async function triggerDownload() {
    setDownloading(true);
    setSubmitError("");

    const fileResult = await getPublicDocumentDownloadUrlAction(
      downloadContext,
      downloadFileName
    );

    if (!fileResult.success) {
      setDownloading(false);
      setSubmitError(fileResult.error);
      return;
    }

    const { url, fileName } = fileResult.data;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);
      window.setTimeout(() => {
        iframe.remove();
      }, 120_000);
    }

    setDownloading(false);
    handleOpenChange(false);
  }

  async function handleSubmit() {
    let valid = true;
    setSubmitError("");

    if (!office.trim()) {
      setOfficeError("Office / Organization / Establishment is required.");
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

    if (!consentAgreed) {
      setConsentError(
        "You must agree to the Privacy Notice and Terms of Use."
      );
      valid = false;
    } else {
      setConsentError("");
    }

    if (!valid) return;

    setSubmitting(true);

    const result = await recordPublicDocumentDownloadAction({
      context: downloadContext,
      requesterName: name.trim() || undefined,
      officeOrg: office.trim(),
      purpose: purpose.trim(),
      consentAgreed: true,
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    await triggerDownload();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Document</DialogTitle>
            <DialogDescription>
              Please provide the following information before downloading this
              document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="download-name">Name (Optional)</Label>
              <Input
                id="download-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="download-office">
                Office / Organization / Establishment{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="download-office"
                value={office}
                onChange={(e) => {
                  setOffice(e.target.value);
                  setOfficeError("");
                }}
                placeholder="Office, organization, or establishment"
                aria-invalid={Boolean(officeError)}
              />
              {officeError ? (
                <p className="text-xs text-destructive">{officeError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="download-purpose">
                Purpose <span className="text-destructive">*</span>
              </Label>
              <Input
                id="download-purpose"
                value={purpose}
                onChange={(e) => {
                  setPurpose(e.target.value);
                  setPurposeError("");
                }}
                placeholder="Purpose of download"
                aria-invalid={Boolean(purposeError)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSubmit();
                }}
              />
              {purposeError ? (
                <p className="text-xs text-destructive">{purposeError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="download-consent"
                  checked={consentAgreed}
                  onCheckedChange={(checked) => {
                    setConsentAgreed(checked === true);
                    setConsentError("");
                  }}
                  aria-invalid={Boolean(consentError)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="download-consent"
                  className="min-w-0 flex-1 cursor-pointer text-sm leading-relaxed text-muted-foreground"
                >
                  I agree that my information will be used only to record this
                  document download and improve public access to legislative
                  records. Read the{" "}
                  <button
                    type="button"
                    className="inline font-medium text-[#1e3a5f] underline underline-offset-2 hover:text-[#3998eb]"
                    onClick={() => setShowPrivacyDialog(true)}
                  >
                    Privacy Notice &amp; Terms of Use
                  </button>
                  .
                </label>
              </div>
              {consentError ? (
                <p className="text-xs text-destructive">{consentError}</p>
              ) : null}
            </div>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting || downloading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || downloading}
            >
              {submitting || downloading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {downloading ? "Downloading..." : "Processing..."}
                </>
              ) : (
                "Download"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Privacy Notice &amp; Terms of Use</DialogTitle>
          </DialogHeader>
          <PrivacyNoticeContent municipalityLabel={municipalityLabel} />
          <DialogFooter>
            <Button type="button" onClick={() => setShowPrivacyDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
