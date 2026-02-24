"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Download, FileText, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { mockMinutes } from "@/lib/mock-data";

export default function MinutesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const doc = mockMinutes.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Minutes not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The session minutes you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/minutes">Back to Minutes</Link>
        </Button>
      </div>
    );
  }

  const metadataFields = [
    {
      label: "Session Date",
      value: format(doc.sessionDate, "MMMM d, yyyy"),
    },
    {
      label: "Session Type",
      value: (
        <Badge variant={doc.sessionType === "special" ? "default" : "outline"}>
          {doc.sessionType === "regular" ? "Regular" : "Special"}
        </Badge>
      ),
    },
    { label: "Session Number", value: doc.sessionNumber || "—" },
    { label: "Presiding Officer", value: doc.presidingOfficer },
    { label: "Prepared By", value: doc.preparedBy },
    { label: "Remarks", value: doc.remarks || "—", span: true },
    { label: "Notes", value: doc.notes || "—", span: true },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/minutes">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Session Minutes — {format(doc.sessionDate, "MMMM d, yyyy")}
            </h1>
            <StatusBadge status={doc.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {doc.sessionType === "regular" ? "Regular" : "Special"} Session No.{" "}
            {doc.sessionNumber}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href={`/admin/minutes/${doc.id}/edit`}>
            <Pencil className="mr-2 size-4" />
            Edit
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href={doc.pdfUrl} download>
            <Download className="mr-2 size-4" />
            Download PDF
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="mr-2 size-4" />
            View PDF
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {metadataFields.map((field) => (
              <div
                key={field.label}
                className={field.span ? "sm:col-span-2" : ""}
              >
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
