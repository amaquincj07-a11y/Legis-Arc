"use client";

import { useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Download } from "lucide-react";

import { getInvoiceById } from "@/lib/billing";
import { mockLGUDepartmentProfile } from "@/lib/mock-data";
import { formatPeso } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABELS = {
  paid: "Paid",
  open: "Open",
  past_due: "Past Due",
} as const;

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const invoice = getInvoiceById(invoiceId);
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <AdminPageHeader title="Invoice Not Found" />
        <Button asChild variant="outline">
          <Link href="/admin/billing?tab=history">
            <ArrowLeft className="mr-2 size-4" />
            Back to Billing History
          </Link>
        </Button>
      </div>
    );
  }

  const lgu = mockLGUDepartmentProfile;
  const resolvedInvoice = invoice;

  function handleDownloadPdf() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${resolvedInvoice.invoiceNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; }
            h1 { font-size: 1.5rem; margin: 0 0 4px; }
            .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; text-align: left; font-size: 0.875rem; }
            th:last-child, td:last-child { text-align: right; }
            .totals { margin-left: auto; width: 240px; font-size: 0.875rem; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .total-row { border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-weight: 700; font-size: 1rem; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <AdminPageHeader
          title={`Invoice for ${invoice.periodLabel}`}
          description={invoice.invoiceNumber}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/billing?tab=history">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          <Button onClick={handleDownloadPdf} className="w-full sm:w-auto">
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">
                Invoice for {invoice.periodLabel}
              </CardTitle>
              <CardDescription className="mt-1">
                {invoice.invoiceNumber}
              </CardDescription>
            </div>
            <Badge
              variant={invoice.status === "paid" ? "secondary" : "destructive"}
              className="w-fit"
            >
              {STATUS_LABELS[invoice.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Billed To
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Sangguniang Bayan of {lgu.municipality}
              </p>
              <p className="text-sm text-muted-foreground">
                {lgu.streetAddress}
              </p>
              <p className="text-sm text-muted-foreground">
                {lgu.municipality}, {lgu.province}
              </p>
            </div>
            <div className="space-y-2 text-sm sm:text-right">
              <div>
                <span className="text-muted-foreground">Issue Date: </span>
                <span className="font-medium">
                  {format(invoice.issueDate, "MMMM d, yyyy")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date: </span>
                <span className="font-medium">
                  {format(invoice.dueDate, "MMMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item) => (
                  <TableRow key={item.description}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPeso(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPeso(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="tabular-nums">{formatPeso(invoice.tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPeso(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={printRef} className="hidden">
        <h1>Invoice for {invoice.periodLabel}</h1>
        <p className="meta">{invoice.invoiceNumber}</p>
        <div className="grid">
          <div>
            <strong>Billed To</strong>
            <p>Sangguniang Bayan of {lgu.municipality}</p>
            <p>{lgu.streetAddress}</p>
            <p>
              {lgu.municipality}, {lgu.province}
            </p>
          </div>
          <div>
            <p>Issue Date: {format(invoice.issueDate, "MMMM d, yyyy")}</p>
            <p>Due Date: {format(invoice.dueDate, "MMMM d, yyyy")}</p>
            <p>Status: {STATUS_LABELS[invoice.status]}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item) => (
              <tr key={item.description}>
                <td>{item.description}</td>
                <td>{formatPeso(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{formatPeso(invoice.subtotal)}</span>
          </div>
          <div>
            <span>Tax</span>
            <span>{formatPeso(invoice.tax)}</span>
          </div>
          <div className="total-row">
            <span>Total</span>
            <span>{formatPeso(invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
