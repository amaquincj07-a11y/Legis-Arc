import { mockInvoices } from "@/lib/mock-data";
import { ensureStaticParams } from "@/lib/supabase/ensure-static-params";

export function generateStaticParams() {
  return ensureStaticParams(
    mockInvoices.map((invoice) => ({ id: invoice.id }))
  );
}

export default function InvoiceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
