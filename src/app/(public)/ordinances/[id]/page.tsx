import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  User,
  Tag,
  BookOpen,
  Info,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { mockOrdinances } from "@/lib/mock-data";
import type { DocumentStatus } from "@/lib/types";

export async function generateStaticParams() {
  return mockOrdinances.map((d) => ({ id: d.id }));
}

function statusBadgeClass(status: DocumentStatus) {
  if (status === "published") return "bg-emerald-500/10 text-emerald-700";
  if (status === "approved") return "bg-blue-500/10 text-blue-700";
  return "bg-gray-500/10 text-gray-600";
}

export default async function OrdinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = mockOrdinances.find((d) => d.id === id);

  if (!doc) notFound();

  const docNumber = doc.approvedNumber || doc.proposedNumber;

  return (
    <div className="min-h-[70vh]">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/portal">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/ordinances">Ordinances</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Ordinance No. {docNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/ordinances">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Ordinances
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Document Header */}
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-navy/10 text-navy">
                  Ordinance
                </Badge>
                <Badge variant="secondary" className="bg-teal/10 text-teal">
                  {doc.category}
                </Badge>
                <Badge
                  variant="secondary"
                  className={statusBadgeClass(doc.status)}
                >
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </Badge>
              </div>

              <p className="text-sm font-semibold text-teal">
                Ordinance No. {docNumber} — Series of {doc.seriesYear}
              </p>

              <h1 className="mt-2 text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                {doc.title}
              </h1>
            </div>

            <Separator className="mb-6" />

            {/* Metadata Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <MetaItem
                icon={User}
                label="Author / Sponsor"
                value={doc.authorSponsor}
              />
              <MetaItem icon={Tag} label="Category" value={doc.category} />
              <MetaItem
                icon={Calendar}
                label="Date Enacted"
                value={format(doc.dateEnacted, "MMMM d, yyyy")}
              />
              <MetaItem
                icon={Calendar}
                label="Date Approved"
                value={format(doc.dateApproved, "MMMM d, yyyy")}
              />
              {doc.publicationInfo && (
                <MetaItem
                  icon={BookOpen}
                  label="Publication Info"
                  value={doc.publicationInfo}
                  className="sm:col-span-2"
                />
              )}
              {doc.remarks && (
                <MetaItem
                  icon={Info}
                  label="Remarks"
                  value={doc.remarks}
                  className="sm:col-span-2"
                />
              )}
            </div>

            {/* Related Documents */}
            {doc.repealsAmendments && (
              <>
                <Separator className="my-6" />
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-foreground">
                    Related Documents
                  </h2>
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="flex items-start gap-3 p-4">
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          Repeals / Amendments
                        </p>
                        <p className="mt-0.5 text-sm text-amber-800/80">
                          {doc.repealsAmendments}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

          {/* Sidebar — PDF Placeholder */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 overflow-hidden border-2 border-dashed border-muted-foreground/20">
              <div className="flex flex-col items-center justify-center bg-muted/30 px-6 py-14 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/10">
                  <FileText className="h-8 w-8 text-navy" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Document PDF
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ordinance No. {docNumber} — Series of {doc.seriesYear}
                </p>
                <div className="mt-5 flex flex-col gap-2 w-full max-w-[200px]">
                  <Button className="gap-2 bg-teal text-white hover:bg-teal/90">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    View Full Screen
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
