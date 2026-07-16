import { mockInvoices } from "@/lib/mock-data";
import { ensureStaticParams } from "@/lib/static-export";

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
