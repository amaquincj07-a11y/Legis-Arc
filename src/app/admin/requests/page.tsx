"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Check, X, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockRequests, mockOrdinances, mockResolutions } from "@/lib/mock-data";
import type { DocumentRequest, RequestStatus } from "@/lib/types";

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  submitted: {
    label: "Submitted",
    className: "border-yellow-300 bg-yellow-50 text-yellow-700",
  },
  approved: {
    label: "Approved",
    className: "border-blue-300 bg-blue-50 text-blue-700",
  },
  released: {
    label: "Released",
    className: "border-transparent bg-emerald-100 text-emerald-700",
  },
  denied: {
    label: "Denied",
    className: "border-red-300 bg-red-50 text-red-700",
  },
};

const allDocuments = [...mockOrdinances, ...mockResolutions];

export default function RequestsPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([
    ...mockRequests,
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestor, setRequestor] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");

  function handleCreateRequest() {
    if (!requestor.trim() || !selectedDocId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const doc = allDocuments.find((d) => d.id === selectedDocId);
    const docTypeLabel = doc
      ? doc.documentType === "ordinance"
        ? "Ordinance"
        : "Resolution"
      : null;
    const documentTitle = doc
      ? `${docTypeLabel} ${doc.approvedNumber || doc.proposedNumber} - ${doc.title.slice(0, 50)}`
      : "Unknown Document";
    const newRequest: DocumentRequest = {
      id: `req-${Date.now()}`,
      requestor: requestor.trim(),
      documentId: selectedDocId,
      documentTitle,
      dateRequested: new Date(),
      status: "submitted",
      processedBy: "Maria Santos",
    };

    setRequests((prev) => [newRequest, ...prev]);
    setDialogOpen(false);
    setRequestor("");
    setSelectedDocId("");
    toast.success("Request created");
  }

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved" as const } : r
      )
    );
    toast.success("Request approved for release");
  }

  function handleDeny(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "denied" as const } : r
      )
    );
    toast.success("Request denied");
  }

  function handleRelease(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "released" as const,
              dateReleased: new Date(),
            }
          : r
      )
    );
    toast.success("Document released");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Document Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Track internal document requests and releases
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0" />
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Requestor</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Released</TableHead>
                <TableHead>Processed By</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      No requests found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="pl-6 font-medium">
                      {req.requestor}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {req.documentTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(req.dateRequested, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusConfig[req.status].className}
                      >
                        {statusConfig[req.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {req.dateReleased
                        ? format(req.dateReleased, "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>{req.processedBy}</TableCell>
                    <TableCell>
                      {req.status === "submitted" && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => handleApprove(req.id)}
                          >
                            <Check className="size-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => handleDeny(req.id)}
                          >
                            <X className="size-3.5" />
                            Deny
                          </Button>
                        </div>
                      )}
                      {req.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleRelease(req.id)}
                        >
                          <Send className="size-3.5" />
                          Release
                        </Button>
                      )}
                      {(req.status === "released" || req.status === "denied") && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-w-[calc(100%-2rem)] pr-10">
          <DialogHeader>
            <DialogTitle>New Document Request</DialogTitle>
          </DialogHeader>
          <div className="grid w-full min-w-0 gap-4 py-4">
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="requestor">
                Requestor Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="requestor"
                value={requestor}
                onChange={(e) => setRequestor(e.target.value)}
                placeholder="e.g. Brgy. Captain Jose Dela Cruz"
                className="w-full min-w-0"
              />
            </div>
            <div className="grid min-w-0 gap-2">
              <Label>
                Document <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger className="w-full min-w-0 overflow-hidden">
                  <SelectValue placeholder="Select a document" className="block truncate" />
                </SelectTrigger>
                <SelectContent>
                  {allDocuments.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.documentType === "ordinance" ? "Ord." : "Res."}{" "}
                      {doc.approvedNumber || doc.proposedNumber} —{" "}
                      {doc.title.slice(0, 60)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateRequest}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
