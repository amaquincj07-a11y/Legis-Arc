import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  User,
  Hash,
  BookOpen,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { mockMinutes } from "@/lib/mock-data";
import type { DocumentStatus } from "@/lib/types";

export async function generateStaticParams() {
  return mockMinutes.map((m) => ({ id: m.id }));
}

function statusBadgeClass(status: DocumentStatus) {
  if (status === "published") return "bg-emerald-500/10 text-emerald-700";
  if (status === "approved") return "bg-blue-500/10 text-blue-700";
  return "bg-gray-500/10 text-gray-600";
}

export default async function MinutesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = mockMinutes.find((m) => m.id === id);

  if (!session) notFound();

  const formattedDate = format(session.sessionDate, "MMMM d, yyyy");

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
                  <Link href="/minutes">Minutes</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{formattedDate}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/minutes">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Minutes
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    session.sessionType === "special"
                      ? "bg-gold/15 text-gold"
                      : "bg-navy/10 text-navy"
                  }
                >
                  {session.sessionType === "regular"
                    ? "Regular Session"
                    : "Special Session"}
                </Badge>
                <Badge
                  variant="secondary"
                  className={statusBadgeClass(session.status)}
                >
                  {session.status.charAt(0).toUpperCase() +
                    session.status.slice(1)}
                </Badge>
              </div>

              <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                Session Minutes — {formattedDate}
              </h1>
              {session.sessionNumber && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Session #{session.sessionNumber}
                </p>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Metadata */}
            <div className="grid gap-4 sm:grid-cols-2">
              <MetaItem
                icon={Calendar}
                label="Session Date"
                value={formattedDate}
              />
              <MetaItem
                icon={BookOpen}
                label="Session Type"
                value={
                  session.sessionType === "regular"
                    ? "Regular Session"
                    : "Special Session"
                }
              />
              {session.sessionNumber && (
                <MetaItem
                  icon={Hash}
                  label="Session Number"
                  value={session.sessionNumber}
                />
              )}
              <MetaItem
                icon={User}
                label="Presiding Officer"
                value={session.presidingOfficer}
              />
              <MetaItem
                icon={User}
                label="Prepared By"
                value={session.preparedBy}
              />
              {session.remarks && (
                <MetaItem
                  icon={Info}
                  label="Remarks"
                  value={session.remarks}
                  className="sm:col-span-2"
                />
              )}
            </div>
          </div>

          {/* Sidebar — PDF actions (open in new tab or download) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-24 overflow-hidden border border-border">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Session Minutes PDF
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formattedDate}
                </p>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <Button className="gap-2 bg-teal text-white hover:bg-teal/90" asChild>
                  <a href={session.pdfUrl} download>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-xs" asChild>
                  <a href={session.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3.5 w-3.5" />
                    View PDF
                  </a>
                </Button>
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
