import { mockOrdinances, mockResolutions } from "@/lib/mock-data";
import type { LegislativeDocument } from "@/lib/types";
import { TrackingDetailClient } from "./tracking-detail-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackingDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const allDocuments = [...mockOrdinances, ...mockResolutions];
  const doc = allDocuments.find((d) => d.id === resolvedParams.id);

  return <TrackingDetailClient doc={doc} />;
}

export function generateStaticParams() {
  const allDocuments = [...mockOrdinances, ...mockResolutions];
  return allDocuments.map((doc) => ({
    id: doc.id,
  }));
}
