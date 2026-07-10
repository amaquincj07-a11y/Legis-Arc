"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Building2, Settings2 } from "lucide-react";
import { useSuperAdminLGUs } from "@/lib/super-admin-lgu-context";
import { getEffectiveLGUStatus } from "@/lib/lgu-subscription";
import { LGUStatusBadge } from "@/components/super-admin/lgu-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LGUTable() {
  const { clients, isLoading } = useSuperAdminLGUs();

  if (isLoading) {
    return (
      <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5">
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="border border-dashed border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="font-medium text-slate-900">No LGU accounts yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first LGU administrator account to get started. Data
              is loaded from your Supabase database.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/90 shadow-sm shadow-slate-900/5">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LGU</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-slate-900">
                    {client.municipality}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.province}
                  </TableCell>
                  <TableCell>
                    <LGUStatusBadge status={getEffectiveLGUStatus(client)} />
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {client.subscriptionEndDate
                      ? format(client.subscriptionEndDate, "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <Link href={`/super-admin/lgus/${client.id}/`}>
                        <Settings2 className="size-3.5" />
                        Manage
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
