"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileText,
  Pencil,
  Globe,
  GlobeLock,
  Circle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { mockOrdinances } from "@/lib/mock-data";

export default function OrdinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const doc = mockOrdinances.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Ordinance not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The ordinance you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/ordinances">Back to Ordinances</Link>
        </Button>
      </div>
    );
  }

  function handleTogglePublish() {
    toast.success(
      doc!.status === "published"
        ? "Ordinance unpublished"
        : "Ordinance published"
    );
  }

  const metadataFields = [
    { label: "Title", value: doc.title, span: true },
    { label: "Author / Sponsor", value: doc.authorSponsor },
    { label: "Category", value: doc.category },
    { label: "Series Year", value: doc.seriesYear },
    {
      label: "Date Enacted",
      value: format(doc.dateEnacted, "MMMM d, yyyy"),
    },
    {
      label: "Date Approved",
      value: format(doc.dateApproved, "MMMM d, yyyy"),
    },
    { label: "Publication Info", value: doc.publicationInfo || "—" },
    { label: "Remarks", value: doc.remarks || "—" },
    { label: "Notes", value: doc.notes || "—", span: true },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/ordinances">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Ordinance No. {doc.approvedNumber || doc.proposedNumber}
            </h1>
            <StatusBadge status={doc.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Series of {doc.seriesYear}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href={`/admin/ordinances/${doc.id}/edit`}>
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
        <Button variant="outline" onClick={handleTogglePublish}>
          {doc.status === "published" ? (
            <>
              <GlobeLock className="mr-2 size-4" />
              Unpublish
            </>
          ) : (
            <>
              <Globe className="mr-2 size-4" />
              Publish
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Document Details</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tracking Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {doc.timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tracking events recorded.
              </p>
            ) : (
              <div className="relative space-y-0">
                {doc.timeline.map((event, index) => {
                  const isLast = index === doc.timeline.length - 1;
                  return (
                    <div key={`${event.status}-${event.date.getTime()}`} className="relative flex gap-3 pb-6 last:pb-0">
                      {!isLast && (
                        <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
                      )}
                      <div className="relative z-10 mt-0.5">
                        <Circle className="size-[15px] fill-primary text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {event.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.performedBy}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
