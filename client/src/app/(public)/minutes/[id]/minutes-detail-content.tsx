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
import { fetchPublicSessionMinutesByIdAction } from "@/lib/public-minutes-actions";
import { useLguHref } from "@/hooks/use-lgu-href";
import { usePlaceFilter } from "@/lib/place-filter-context";
import { formatSessionDateDisplay } from "@/lib/session-date";
import type { SessionMinutes } from "@/lib/types";

export function MinutesDetailContent({ id }: { id: string }) {
  const { href } = useLguHref();
  const { province, municipality, municipalityName } = usePlaceFilter();
  const [session, setSession] = useState<SessionMinutes | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setSession(null);

      const result = await fetchPublicSessionMinutesByIdAction(
        province,
        municipality,
        id
      );

      if (cancelled) return;

      if (result.success) {
        setSession(result.data);
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
        <p className="text-sm text-muted-foreground">Loading session minutes...</p>
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-[family-name:var(--font-garamond)] text-2xl font-semibold">
          Session minutes not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          These session minutes are unavailable for the selected location or are not
          published.
        </p>
        <Link href={href("/minutes")} className="mt-6 inline-block">
          <Button variant="outline">Back to Sessions</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = formatSessionDateDisplay(session.sessionDate);

  return (
    <div className="min-h-[70vh]">
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={href("")}>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={href("/minutes")}>Sessions</Link>
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
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Link href={href("/minutes")} className="self-start">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Sessions
            </Button>
          </Link>
          <CertifiedCopyNotice />
          <div className="hidden w-[140px] sm:block" aria-hidden />
        </div>

        <Card className="overflow-hidden border border-border">
          <PdfViewerDynamic
            pdfUrl={session.pdfUrl}
            title={`Session Minutes — ${formattedDate}`}
            downloadContext={{
              province,
              municipality,
              municipalityLabel: municipalityName,
              documentId: session.id,
              documentType: "minutes",
              documentNumber: formattedDate,
              documentTitle: `Session Minutes — ${formattedDate}`,
              documentCategory:
                session.sessionType === "special" ? "Special Session" : "Regular Session",
            }}
          />
        </Card>
      </div>
    </div>
  );
}
