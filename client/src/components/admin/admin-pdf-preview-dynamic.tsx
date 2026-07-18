"use client";

import dynamic from "next/dynamic";

const AdminPdfPreviewInner = dynamic(
  () =>
    import("@/components/admin/admin-pdf-preview").then(
      (mod) => mod.AdminPdfPreview
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-md border bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-[#3998eb]" />
          <p className="text-sm text-muted-foreground">
            Loading document viewer…
          </p>
        </div>
      </div>
    ),
  }
);

export function AdminPdfPreviewDynamic({
  source,
  title,
  className,
}: {
  source: string | File;
  title?: string;
  className?: string;
}) {
  return (
    <AdminPdfPreviewInner source={source} title={title} className={className} />
  );
}
