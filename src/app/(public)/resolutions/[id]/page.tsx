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
import { mockResolutions } from "@/lib/mock-data";
import { PdfViewerDynamic } from "@/components/public/pdf-viewer-dynamic";

// ADD THIS FUNCTION - required for static export
export async function generateStaticParams() {
  // Return an array of params for all resolutions that should be pre-rendered
  return mockResolutions.map((doc) => ({
    id: doc.id,
  }));
}

export default async function ResolutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = mockResolutions.find((d) => d.id === id);

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
                  <Link href="/resolutions">Resolutions</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Resolution No. {docNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/resolutions">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Resolutions
          </Button>
        </Link>

        {/* PDF Viewer */}
        <Card className="overflow-hidden border border-border">
          <PdfViewerDynamic
            pdfUrl={doc.pdfUrl}
            title={`Resolution No. ${docNumber} — Series of ${doc.seriesYear}`}
          />
        </Card>
      </div>
    </div>
  );
}