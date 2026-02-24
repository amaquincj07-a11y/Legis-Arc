"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, X, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/admin/status-badge";
import { mockOrdinances, mockResolutions } from "@/lib/mock-data";
import type { LegislativeDocument, RoutingHistoryEntry } from "@/lib/types";

const OFFICES = [
  "SB Office",
  "Mayor's Office",
  "Committee on Finance",
  "Committee on Tourism",
  "Committee on Environment",
  "Legal Office",
  "Committee on Rules",
];

const STAGES = [
  "For Review",
  "For Signature",
  "For Publication",
  "Drafted",
  "Approved",
  "Published",
  "In transit",
];

export default function TrackingPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LegislativeDocument[]>(() => [
    ...mockOrdinances,
    ...mockResolutions,
  ]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [moveToDoc, setMoveToDoc] = useState<LegislativeDocument | null>(null);
  const [moveOffice, setMoveOffice] = useState("");
  const [moveAssignedTo, setMoveAssignedTo] = useState("");
  const [moveStage, setMoveStage] = useState("");
  const [moveRemark, setMoveRemark] = useState("");

  const filtered = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch =
          !search || doc.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || doc.status === statusFilter;
        const matchesType =
          typeFilter === "all" || doc.documentType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [documents, search, statusFilter, typeFilter]);

  const hasActiveFilters =
    search || statusFilter !== "all" || typeFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  }

  function openMoveTo(doc: LegislativeDocument, e: React.MouseEvent) {
    e.stopPropagation();
    setMoveToDoc(doc);
    setMoveOffice(doc.currentOffice ?? "");
    setMoveAssignedTo(doc.assignedTo ?? "");
    setMoveStage(doc.stage ?? "");
    setMoveRemark("");
  }

  function closeMoveTo() {
    setMoveToDoc(null);
    setMoveOffice("");
    setMoveAssignedTo("");
    setMoveStage("");
    setMoveRemark("");
  }

  function confirmMoveTo() {
    if (!moveToDoc || !moveOffice.trim() || !moveAssignedTo.trim()) {
      toast.error("Please select office and assign a person");
      return;
    }
    const stage = moveStage.trim() || "In transit";
    const entry: RoutingHistoryEntry = {
      office: moveOffice.trim(),
      assignedTo: moveAssignedTo.trim(),
      stage,
      date: new Date(),
      remark: moveRemark.trim() || undefined,
    };
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === moveToDoc.id && d.documentType === moveToDoc.documentType
          ? {
              ...d,
              currentOffice: moveOffice.trim(),
              assignedTo: moveAssignedTo.trim(),
              stage,
              routingHistory: [...(d.routingHistory ?? []), entry],
              updatedAt: new Date(),
            }
          : d
      )
    );
    toast.success("Document moved and routing logged");
    closeMoveTo();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Legislative Tracking
        </h1>
        <p className="text-sm text-muted-foreground">
          Track the status of all legislative documents — current location,
          assigned person, and stage
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ordinance">Ordinance</SelectItem>
                  <SelectItem value="resolution">Resolution</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Document No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Office</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      No documents found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow
                    key={`${doc.documentType}-${doc.id}`}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/admin/${doc.documentType === "ordinance" ? "ordinances" : "resolutions"}/${doc.id}`
                      )
                    }
                  >
                    <TableCell className="pl-6 font-medium">
                      {doc.approvedNumber || doc.proposedNumber}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize"
                      >
                        {doc.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">
                      {doc.title}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {doc.currentOffice ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {doc.assignedTo ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {doc.stage ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(doc.updatedAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={(e) => openMoveTo(doc, e)}
                      >
                        <ArrowRight className="size-3.5" />
                        Move To
                      </Button>
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
            <DialogTitle>Move document</DialogTitle>
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
              <Label htmlFor="office">Next office / committee</Label>
              <Select
                value={moveOffice}
                onValueChange={setMoveOffice}
              >
                <SelectTrigger id="office">
                  <SelectValue placeholder="Select office" />
                </SelectTrigger>
                <SelectContent>
                  {OFFICES.map((office) => (
                    <SelectItem key={office} value={office}>
                      {office}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assign to (person responsible)</Label>
              <Input
                id="assignedTo"
                value={moveAssignedTo}
                onChange={(e) => setMoveAssignedTo(e.target.value)}
                placeholder="e.g. Maria Santos, Municipal Mayor"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={moveStage} onValueChange={setMoveStage}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remark">Remark (optional)</Label>
              <Input
                id="remark"
                value={moveRemark}
                onChange={(e) => setMoveRemark(e.target.value)}
                placeholder="e.g. For review, For signature"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMoveTo}>
              Cancel
            </Button>
            <Button onClick={confirmMoveTo}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
