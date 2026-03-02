"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download, Search, X } from "lucide-react";

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
import { mockAuditLogs } from "@/lib/mock-data";

const actionVariant: Record<string, string> = {
  upload: "border-transparent bg-blue-100 text-blue-700",
  publish: "border-transparent bg-emerald-100 text-emerald-700",
  edit: "border-transparent bg-amber-100 text-amber-700",
  login: "border-transparent bg-gray-100 text-gray-700",
  logout: "border-transparent bg-gray-100 text-gray-700",
};

const uniqueUsers = [...new Set(mockAuditLogs.map((l) => l.userName))];
const uniqueActions = [...new Set(mockAuditLogs.map((l) => l.action))];

export default function RecentActivityPage() {
  const [userFilter, setUserFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      const matchesUser =
        userFilter === "all" || log.userName === userFilter;
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;
      const matchesSearch =
        !search ||
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        (log.documentTitle ?? "").toLowerCase().includes(search.toLowerCase());

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
  }, [userFilter, actionFilter, dateFrom, dateTo, search]);

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
    toast.success("Recent activity exported to CSV");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recent Activity</h1>
          <p className="text-sm text-muted-foreground">
            View system activity history — read-only, immutable records
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
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
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
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
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 size-4" />
                  Clear All
                </Button>
              )}
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
                <TableHead>Document</TableHead>
                <TableHead className="hidden lg:table-cell">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      No recent activity found.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="pl-6 text-muted-foreground whitespace-nowrap">
                      {format(log.timestamp, "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.userName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          actionVariant[log.action] ?? "bg-gray-100 text-gray-700"
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">
                      {log.documentTitle ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
