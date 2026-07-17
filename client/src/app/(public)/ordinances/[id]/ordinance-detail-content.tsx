"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { PdfViewerDynamic } from "@/components/public/pdf-viewer-dynamic";
import { CertifiedCopyNotice } from "@/components/public/certified-copy-notice";
import { fetchPublicOrdinanceByIdAction } from "@/lib/public-ordinance-actions";
import { usePlaceFilter } from "@/lib/place-filter-context";
import { formatOrdinanceNumber } from "@/lib/utils";
import type { LegislativeDocument } from "@/lib/types";

export function OrdinanceDetailContent({ id }: { id: string }) {
  const { province, municipality, municipalityName } = usePlaceFilter();
  const [doc, setDoc] = useState<LegislativeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setDoc(null);

      const result = await fetchPublicOrdinanceByIdAction(
        province,
        municipality,
        id
      );

      if (cancelled) return;

      if (result.success) {
        setDoc(result.data);
      } else {
        setNotFound(true);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, province, municipality]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading ordinance...</p>
      </div>
    );
  }

  if (notFound || !doc) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl font-semibold">
          Ordinance not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          This ordinance is unavailable for the selected location or is not published.
        </p>
        <Link href="/ordinances" className="mt-6 inline-block">
          <Button variant="outline">Back to Ordinances</Button>
        </Link>
      </div>
    );
  }

  const docNumber = formatOrdinanceNumber(doc);

  return (
    <div className="min-h-[70vh]">
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/home">Home</Link>
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
                <BreadcrumbPage>{docNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Link href="/ordinances" className="self-start">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Ordinances
            </Button>
          </Link>
          <CertifiedCopyNotice />
          <div className="hidden w-[140px] sm:block" aria-hidden />
        </div>

        <Card className="overflow-hidden border border-border">
          <PdfViewerDynamic
            pdfUrl={doc.pdfUrl}
            title={docNumber}
            downloadContext={{
              province,
              municipality,
              municipalityLabel: municipalityName,
              documentId: doc.id,
              documentType: "ordinance",
              documentNumber: doc.approvedNumber || doc.proposedNumber,
              documentTitle: doc.title,
              documentCategory: doc.category,
            }}
          />
        </Card>
      </div>
    </div>
  );
}
