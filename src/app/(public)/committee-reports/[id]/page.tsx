import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { mockCommitteeReports } from "@/lib/mock-data";
import { PdfViewerDynamic } from "@/components/public/pdf-viewer-dynamic";

export async function generateStaticParams() {
  return mockCommitteeReports.map((r) => ({ id: r.id }));
}

export default async function CommitteeReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = mockCommitteeReports.find((r) => r.id === id);

  if (!report) notFound();

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
                  <Link href="/committee-reports">Committee Reports</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{report.reportNo}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/committee-reports">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Committee Reports
          </Button>
        </Link>

        {/* PDF Viewer */}
        <Card className="overflow-hidden border border-border">
          <PdfViewerDynamic
            pdfUrl={report.pdfUrl}
            title={`${report.reportNo} — ${report.subject}`}
          />
        </Card>
      </div>
    </div>
  );
}
