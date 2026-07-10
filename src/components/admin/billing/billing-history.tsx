"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import { fetchLGUBillingHistoryAction } from "@/lib/lgu-billing-actions";
import { formatPeso } from "@/lib/utils";
import type { BillingHistoryEntry } from "@/lib/types";
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
import { Skeleton } from "@/components/ui/skeleton";

export function BillingHistory() {
  const [history, setHistory] = useState<BillingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await fetchLGUBillingHistoryAction();
      if (cancelled) return;

      if (!result.success) {
        setError(result.error);
        setHistory([]);
      } else {
        setError(null);
        setHistory(result.data);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Billing History</CardTitle>
        <CardDescription>
          Payment records from each activated annual subscription period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {error}
          </p>
        ) : history.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No billing history yet. Records appear when your subscription is
            activated as paid.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Paid On</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="w-[140px] text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {format(entry.date, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-slate-900">
                      {formatPeso(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
