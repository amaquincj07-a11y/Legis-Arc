"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download, Search, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { fetchLGUActivityLogsAction } from "@/lib/activity-actions";
import { ADMIN_CACHE_KEYS } from "@/lib/admin-query-cache";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { formatActivityModuleLabel } from "@/lib/mappers/activity-log-mapper";

const ACTION_OPTIONS = ["upload", "edit", "delete", "publish"] as const;
const ITEMS_PER_PAGE = 10;
const MAX_ACTIVITY_LOGS = 50;

const actionVariant: Record<string, string> = {
  upload: "border-transparent bg-blue-100 text-blue-700",
  publish: "border-transparent bg-emerald-100 text-emerald-700",
  edit: "border-transparent bg-amber-100 text-amber-700",
  delete: "border-transparent bg-red-100 text-red-700",
};

function formatActionLabel(action: string) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function RecentActivityPage() {
  const { data, loading, error } = useAdminQuery(
    ADMIN_CACHE_KEYS.activity,
    fetchLGUActivityLogsAction
  );
  const logs = data ?? [];
  const [userFilter, setUserFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueUsers = useMemo(
    () => [...new Set(logs.map((log) => log.userName))].sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesUser =
        userFilter === "all" || log.userName === userFilter;
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;
      const moduleLabel = log.module
        ? formatActivityModuleLabel(log.module)
        : "";
      const matchesSearch =
        !search ||
        (log.documentTitle ?? "").toLowerCase().includes(search.toLowerCase()) ||
        moduleLabel.toLowerCase().includes(search.toLowerCase()) ||
        log.userName.toLowerCase().includes(search.toLowerCase());

      let matchesDate = true;
      if (dateFrom) {
        matchesDate =
          matchesDate && log.timestamp >= new Date(dateFrom + "T00:00:00");
      }
      if (dateTo) {
        matchesDate =
          matchesDate && log.timestamp <= new Date(dateTo + "T23:59:59");
      }

      return matchesUser && matchesAction && matchesSearch && matchesDate;
    });
  }, [logs, userFilter, actionFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [userFilter, actionFilter, dateFrom, dateTo, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  const hasActiveFilters =
    search ||
    userFilter !== "all" ||
    actionFilter !== "all" ||
    dateFrom ||
    dateTo;

  function clearFilters() {
    setSearch("");
    setUserFilter("all");
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.error("No activity to export.");
      return;
    }

    const headers = ["Date/Time", "User", "Action", "Module", "Document"];
    const rows = filtered.map((log) => [
      format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
      log.userName,
      log.action,
      log.module ? formatActivityModuleLabel(log.module) : "",
      log.documentTitle ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recent-activity-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Recent activity exported to CSV");
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#3998eb]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Recent Activity
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload, edit, publish, and delete actions by all LGU users. Keeps
            the latest {MAX_ACTIVITY_LOGS} entries (oldest removed first).
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by user, module, or document..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {ACTION_OPTIONS.map((action) => (
                      <SelectItem key={action} value={action}>
                        {formatActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Date range:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto"
              />
              {hasActiveFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 size-4" />
                  Clear All
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Date / Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Document</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      No recent activity found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="pl-6 whitespace-nowrap text-muted-foreground">
                      {format(log.timestamp, "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="font-medium">{log.userName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          actionVariant[log.action] ??
                          "bg-gray-100 text-gray-700"
                        }
                      >
                        {formatActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.module
                        ? formatActivityModuleLabel(log.module)
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {log.documentTitle ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <AdminPagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
