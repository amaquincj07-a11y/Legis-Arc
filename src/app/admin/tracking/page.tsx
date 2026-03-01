"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, X, ArrowRight, Upload, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockOrdinances, mockResolutions } from "@/lib/mock-data";
import { useTracking } from "./tracking-context";
import type { LegislativeDocument, ReferralType, TrackingStatus } from "@/lib/types";

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

// Committees
const COMMITTEES = [
  "Committee of the Whole / En Banc",
  "Committee on Laws, Rules & Internal Affairs",
  "Committee on Finance, Budget and Appropriations",
  "Committee on Education",
  "Committee on Ways and Means",
  "Committee on Economic Development and Social Enterprise",
  "Committee on Health and Social Services",
  "Committee on Public Works, Infrastructure & Public Utilities",
  "Committee on Barangay Affairs and Tourism",
  "Committee on Cultural Communities",
  "Committee on Trade, Commerce & Enterprises",
  "Committee on Youth and Sports Development",
  "Committee on Agriculture, Fisheries, Food and Agrarian Reform",
  "Committee on Labor and Employment",
  "Committee on Human Rights",
  "Committee on Industry and Commerce",
  "Committee on Science and Technology",
  "Committee on Games and Amusements",
  "Committee on Gender and Development",
  "Committee on Human Settlement, Land Use & Development",
  "Committee on Public Works, Resolutions, Ordinances & Solutions",
  "Committee on Peace & Order and Public Safety",
  "Committee on Government Organizations and Non-Government Organizations",
  "Committee on Justice and International Relations",
  "Committee on Beautification, Parks & Streets",
  "Committee on Information and Media Affairs",
  "Committee on Government Enterprises and Market",
  "Committee on Cooperative and Livelihood",
  "Committee on Transportation",
];

export default function TrackingPage() {
  const router = useRouter();
  const { documents, updateDocument } = useTracking();
  const [search, setSearch] = useState("");
  const [referralFilter, setReferralFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [moveToDoc, setMoveToDoc] = useState<LegislativeDocument | null>(null);
  const [moveCommittee, setMoveCommittee] = useState("");
  const [moveStatus, setMoveStatus] = useState("");
  const [moveReferralType, setMoveReferralType] = useState("");
  const [moveRemark, setMoveRemark] = useState("");
  const [moveLegislativeOutput, setMoveLegislativeOutput] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [uploadSessionDate, setUploadSessionDate] = useState<string>("");
  const [uploadReferralType, setUploadReferralType] = useState<string>("");
  const [uploadSubject, setUploadSubject] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadCommittee, setUploadCommittee] = useState<string>("");

  const filtered = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch =
          !search || doc.title.toLowerCase().includes(search.toLowerCase());
        const matchesReferral =
          referralFilter === "all" || doc.referralType === referralFilter;
        const matchesStatus =
          statusFilter === "all" || doc.stage === statusFilter;
        return matchesSearch && matchesReferral && matchesStatus;
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [documents, search, referralFilter, statusFilter]);

  const hasActiveFilters =
    search || referralFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setReferralFilter("all");
    setStatusFilter("all");
  }

  function openMoveTo(doc: LegislativeDocument, e: React.MouseEvent) {
    e.stopPropagation();
    setMoveToDoc(doc);
    setMoveCommittee(doc.assignedCommittee ?? "");
    setMoveReferralType(doc.referralType ?? "");
    setMoveStatus(doc.stage ?? "");
    setMoveLegislativeOutput(doc.legislativeOutput ?? "");
    setMoveRemark("");
  }

  function closeMoveTo() {
    setMoveToDoc(null);
    setMoveCommittee("");
    setMoveReferralType("");
    setMoveStatus("");
    setMoveLegislativeOutput("");
    setMoveRemark("");
  }

  function confirmMoveTo() {
    if (!moveToDoc || !moveCommittee.trim() || !moveStatus.trim()) {
      toast.error("Please select committee and status");
      return;
    }
    
    updateDocument(moveToDoc.id, moveToDoc.documentType, {
      assignedCommittee: moveCommittee.trim(),
      referralType: (moveReferralType.trim() as ReferralType) || moveToDoc.referralType,
      stage: moveStatus.trim() as TrackingStatus,
      legislativeOutput: moveLegislativeOutput.trim() || moveToDoc.legislativeOutput,
      sessionDate: moveToDoc.sessionDate || new Date(),
    });
    toast.success("Document tracking updated successfully");
    closeMoveTo();
  }

  function openUploadDialog() {
    setShowUploadDialog(true);
    setUploadFile(null);
    setSelectedDocId("");
    setUploadSessionDate("");
    setUploadReferralType("");
    setUploadSubject("");
    setUploadStatus("");
    setUploadCommittee("");
  }

  function closeUploadDialog() {
    setShowUploadDialog(false);
    setUploadFile(null);
    setSelectedDocId("");
    setUploadSessionDate("");
    setUploadReferralType("");
    setUploadSubject("");
    setUploadStatus("");
    setUploadCommittee("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error("File size must be less than 25MB");
        return;
      }
      setUploadFile(file);
    }
  }

  function confirmUpload() {
    if (!uploadFile || !selectedDocId.trim()) {
      toast.error("Please select a document and upload a file");
      return;
    }

    if (
      !uploadSessionDate.trim() ||
      !uploadReferralType.trim() ||
      !uploadSubject.trim() ||
      !uploadStatus.trim() ||
      !uploadCommittee.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const doc = documents.find((d) => d.id === selectedDocId);
    if (!doc) {
      toast.error("Document not found");
      return;
    }

    // Update document with new version and tracking details
    updateDocument(doc.id, doc.documentType, {
      pdfUrl: URL.createObjectURL(uploadFile),
      sessionDate: new Date(uploadSessionDate),
      referralType: uploadReferralType as ReferralType,
      trackingSubject: uploadSubject.trim(),
      stage: uploadStatus as TrackingStatus,
      assignedCommittee: uploadCommittee.trim(),
      versions: [
        ...(doc.versions || []),
        {
          versionNumber: (doc.versions?.length || 0) + 1,
          pdfUrl: URL.createObjectURL(uploadFile),
          uploadedBy: "maria.santos@panglao.gov.ph",
          uploadedAt: new Date(),
          notes: `Version ${(doc.versions?.length || 0) + 1} uploaded`,
        },
      ],
    });

    toast.success(`File uploaded successfully for ${doc.title}`);
    closeUploadDialog();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Legislative Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Track referral status, assigned committees, and legislative output of all documents
          </p>
        </div>
        <Button 
          className="gap-2"
          onClick={openUploadDialog}
        >
          <Upload className="size-4" />
          Upload File
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by subject/title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={referralFilter} onValueChange={setReferralFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Referral Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {REFERRAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {TRACKING_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 size-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 whitespace-nowrap">Session Date</TableHead>
                <TableHead className="whitespace-nowrap">Referral Type</TableHead>
                <TableHead className="min-w-[240px]">Subject</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="min-w-[200px]">Committee (Required to)</TableHead>
                <TableHead className="whitespace-nowrap">Legislative Output</TableHead>
                <TableHead className="whitespace-nowrap">Last updated(Timestamp)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      No documents found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow
                    key={`${doc.documentType}-${doc.id}`}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/admin/tracking/${doc.id}`)}
                  >
                    <TableCell className="pl-6 font-medium whitespace-nowrap">
                      {doc.sessionDate
                        ? format(doc.sessionDate, "yyyy-MM-dd")
                        : format(doc.dateApproved, "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="capitalize">
                        {REFERRAL_TYPES.find((t) => t.value === doc.referralType)?.label || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[240px] break-words whitespace-normal">
                      {doc.trackingSubject || doc.title}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          doc.stage === "for_approval" || doc.stage === "for_signature"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {TRACKING_STATUSES.find((s) => s.value === doc.stage)?.label || doc.stage || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] break-words whitespace-normal">
                      {doc.assignedCommittee || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {doc.legislativeOutput || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span className="whitespace-nowrap">
                          {format(doc.updatedAt, "MMM d, yyyy HH:mm")}
                        </span>
                        <span className="text-xs">
                          {doc.lastUpdatedByEmail || "—"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!moveToDoc} onOpenChange={(open) => !open && closeMoveTo()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Document Tracking</DialogTitle>
          </DialogHeader>
          {moveToDoc && (
            <p className="text-sm text-muted-foreground">
              {moveToDoc.documentType === "ordinance" ? "Ordinance" : "Resolution"}{" "}
              {moveToDoc.approvedNumber || moveToDoc.proposedNumber} —{" "}
              {moveToDoc.title.slice(0, 50)}…
            </p>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="referral-type">Referral Type</Label>
              <Select
                value={moveReferralType}
                onValueChange={setMoveReferralType}
              >
                <SelectTrigger id="referral-type">
                  <SelectValue placeholder="Select referral type" />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="committee">Committee (Required to) *</Label>
              <Select
                value={moveCommittee}
                onValueChange={setMoveCommittee}
              >
                <SelectTrigger id="committee">
                  <SelectValue placeholder="Select committee" />
                </SelectTrigger>
                <SelectContent>
                  {COMMITTEES.map((committee) => (
                    <SelectItem key={committee} value={committee}>
                      {committee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={moveStatus} onValueChange={setMoveStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {TRACKING_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="legislative-output">Legislative Output</Label>
              <Input
                id="legislative-output"
                value={moveLegislativeOutput}
                onChange={(e) => setMoveLegislativeOutput(e.target.value)}
                placeholder="e.g. Ordinance Passed, Resolution Approved"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remark">Remarks (optional)</Label>
              <Input
                id="remark"
                value={moveRemark}
                onChange={(e) => setMoveRemark(e.target.value)}
                placeholder="e.g. Pending mayor signature, Under review"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMoveTo}>
              Cancel
            </Button>
            <Button onClick={confirmMoveTo}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => !open && closeUploadDialog()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document File & Update Tracking</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Upload PDF and update tracking details for the document</p>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Document Selection */}
            <div className="space-y-2">
              <Label htmlFor="doc-select">Select Document *</Label>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger id="doc-select">
                  <SelectValue placeholder="Choose a document..." />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.approvedNumber || doc.proposedNumber} - {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session Date */}
            <div className="space-y-2">
              <Label htmlFor="session-date">Session Date *</Label>
              <Input
                id="session-date"
                type="date"
                value={uploadSessionDate}
                onChange={(e) => setUploadSessionDate(e.target.value)}
              />
            </div>

            {/* Referral Type */}
            <div className="space-y-2">
              <Label htmlFor="referral-type">Referral Type *</Label>
              <Select value={uploadReferralType} onValueChange={setUploadReferralType}>
                <SelectTrigger id="referral-type">
                  <SelectValue placeholder="Select referral type..." />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                placeholder="e.g. Municipal Budget Allocation"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={uploadStatus} onValueChange={setUploadStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {TRACKING_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Committee */}
            <div className="space-y-2">
              <Label htmlFor="committee">Committee (Required to) *</Label>
              <Select value={uploadCommittee} onValueChange={setUploadCommittee}>
                <SelectTrigger id="committee">
                  <SelectValue placeholder="Select committee..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMITTEES.map((committee) => (
                    <SelectItem key={committee} value={committee}>
                      {committee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">PDF File *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  {uploadFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="size-8 text-primary" />
                      <p className="text-sm font-medium">{uploadFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="size-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF up to 25MB</p>
                    </div>
                  )}
                </label>
              </div>
              {uploadFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setUploadFile(null)}
                >
                  Remove File
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeUploadDialog}>
              Cancel
            </Button>
            <Button
              onClick={confirmUpload}
              disabled={
                !uploadFile ||
                !selectedDocId ||
                !uploadSessionDate ||
                !uploadReferralType ||
                !uploadSubject ||
                !uploadStatus ||
                !uploadCommittee
              }
            >
              Upload & Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
