import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
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
import { mockMinutes } from "@/lib/mock-data";
import { PdfViewerDynamic } from "@/components/public/pdf-viewer-dynamic";

export async function generateStaticParams() {
  return mockMinutes.map((m) => ({ id: m.id }));
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

        {/* PDF Viewer */}
        <Card className="overflow-hidden border border-border">
          <PdfViewerDynamic
            pdfUrl={session.pdfUrl}
            title={`Session Minutes — ${formattedDate}`}
          />
        </Card>
      </div>
    </div>
  );
}
