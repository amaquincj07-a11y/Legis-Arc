"use client";

import { use } from "react";
import { LGUDetailPageContent } from "@/components/super-admin/lgu-detail-page-content";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function LGUDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <LGUDetailPageContent id={id} />;
}
