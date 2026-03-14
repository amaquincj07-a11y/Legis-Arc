"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Download, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTracking } from "../tracking-context";
import type { LegislativeDocument } from "@/lib/types";

// Referral Types
const REFERRAL_TYPES = [
  { value: "letter", label: "Letter" },
  { value: "brgy_resolution", label: "Brgy Resolution" },
  { value: "brgy_ordinance", label: "Brgy Ordinance" },
  { value: "subd_application", label: "Subd Application" },
  { value: "accreditation", label: "Accreditation" },
  { value: "board_council_resolutions", label: "Board/Council Resolutions" },
  { value: "memorandum", label: "Memorandum" },
  { value: "executive_orders", label: "Executive Orders" },
  { value: "draft_resolutions", label: "Draft Resolutions" },
  { value: "draft_ordinance", label: "Draft Ordinance" },
  { value: "others", label: "Others" },
];

// Tracking Statuses
const TRACKING_STATUSES = [
  { value: "for_referral", label: "For referral" },
  { value: "under_committee", label: "Under committee" },
  { value: "for_public_hearing", label: "For public hearing" },
  { value: "for_committee_report", label: "For committee report" },
  { value: "for_signature", label: "For signature" },
  { value: "for_approval", label: "For approval" },
  { value: "for_reporting", label: "For reporting" },
  { value: "others", label: "Others" },
];

interface TrackingDetailClientProps {
  doc: LegislativeDocument | undefined;
}

export function TrackingDetailClient({ doc }: TrackingDetailClientProps) {
  const router = useRouter();
  const { updateDocumentStatus } = useTracking();
  const [currentStatus, setCurrentStatus] = useState(doc?.stage || "");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(doc?.stage || "");

  if (!doc) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Document not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const docType =
    doc.documentType === "ordinance"
      ? "Ordinance"
      : doc.documentType === "resolution"
        ? "Resolution"
        : "Document";

  const docNumber = doc.approvedNumber || doc.proposedNumber || doc.id;

  function openStatusDialog() {
    setSelectedStatus(currentStatus);
    setShowStatusDialog(true);
  }

  function closeStatusDialog() {
    setShowStatusDialog(false);
  }

  function confirmStatusChange() {
    if (!selectedStatus.trim()) {
      toast.error("Please select a status");
      return;
    }
    
    if (doc) {
      updateDocumentStatus(doc.id, doc.documentType, selectedStatus);
      setCurrentStatus(selectedStatus);
      toast.success(`Status updated to "${TRACKING_STATUSES.find((s) => s.value === selectedStatus)?.label || selectedStatus}"`);
      closeStatusDialog();
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back to Tracking
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
              {docType} Tracking Details
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {docType} {docNumber} — {doc.title}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button className="gap-2 rounded-full bg-[#cbab53] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-slate-900 shadow-md shadow-[#cbab53]/35 transition hover:bg-[#b89745] hover:shadow-lg hover:shadow-[#cbab53]/40">
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          className="gap-2 rounded-full border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-700 hover:border-[#3998eb]/80 hover:bg-white"
        >
          <Download className="size-4" />
          Download PDF
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 rounded-full border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-700 hover:border-[#3998eb]/80 hover:bg-white"
          onClick={() => window.open("/documents/MUN_ORD_02_2017_SNORKELING_ORDINANCE.pdf", "_blank")}
        >
          <Eye className="size-4" />
          View PDF
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Session & Document Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1 - Session Date & Referral Type */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Session Date
                </p>
                <p className="text-base font-semibold">
                  {doc.sessionDate
                    ? format(doc.sessionDate, "MMMM d, yyyy")
                    : format(doc.dateApproved, "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Referral Type
                </p>
                <Badge variant="outline" className="capitalize">
                  {REFERRAL_TYPES.find((t) => t.value === doc.referralType)?.label ||
                    "—"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Row 2 - Full width */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Subject
              </p>
              <p className="text-base font-semibold">
                {doc.trackingSubject || doc.title}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Status & Committee */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Tracking Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Current Status
              </p>
              <button
                onClick={openStatusDialog}
                className="group select-none"
              >
                <Badge
                  variant={
                    currentStatus === "for_approval" || currentStatus === "for_signature"
                      ? "default"
                      : "secondary"
                  }
                  className="cursor-pointer rounded-full px-3 py-2 text-[12px] font-medium capitalize hover:opacity-80 transition-opacity"
                >
                  {TRACKING_STATUSES.find((s) => s.value === currentStatus)?.label ||
                    currentStatus ||
                    "—"}
                </Badge>
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Click to change status
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Assigned Committee
              </p>
              <p className="text-sm leading-relaxed">
                {doc.assignedCommittee || "—"}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Legislative Output
              </p>
              <p className="text-sm">{doc.legislativeOutput || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Update Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Last Updated
              </p>
              <p className="text-sm font-semibold">
                {format(doc.updatedAt, "MMMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(doc.updatedAt, "HH:mm")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Updated By
              </p>
              <p className="text-sm font-semibold">{doc.lastUpdatedByEmail || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={(open) => !open && closeStatusDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Document Status</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Select a new status for this document:
          </p>
          <div className="grid gap-3">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {TRACKING_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="capitalize">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeStatusDialog}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
