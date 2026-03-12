"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FileText, Calendar, ArrowRight, Eye } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { mockResolutions, mockCategories } from "@/lib/mock-data";

const PUBLIC_RESOLUTIONS = mockResolutions.filter((d) => d.isPublic);

const YEARS = [...new Set(PUBLIC_RESOLUTIONS.map((d) => d.seriesYear))].sort(
  (a, b) => b - a
);
const AUTHORS = [
  ...new Set(PUBLIC_RESOLUTIONS.map((d) => d.authorSponsor)),
].sort();

export default function ResolutionsPage() {
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    let docs = PUBLIC_RESOLUTIONS;
    if (yearFilter !== "all") {
      docs = docs.filter((d) => d.seriesYear === Number(yearFilter));
    }
    if (categoryFilter !== "all") {
      docs = docs.filter((d) => d.category === categoryFilter);
    }
    return docs.sort(
      (a, b) => b.dateApproved.getTime() - a.dateApproved.getTime()
    );
  }, [yearFilter, categoryFilter]);

  return (
    <div className="min-h-[70vh]">
      {/* Page Header */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
              <FileText className="h-5 w-5 text-teal" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Resolutions
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Browse published resolutions of the Sangguniang Bayan ng Panglao.
            Resolutions express the formal will of the legislative body on
            matters of public interest and governance.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-xs font-medium text-muted-foreground">
            Filter by:
          </span>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {mockCategories
                .filter((c) => c.isActive)
                .map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <span className="text-xs text-muted-foreground">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">No</th>
              <th className="border border-gray-300 px-4 py-2">Series</th>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Date Approved</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc, index) => (
              <tr key={doc.id} className="odd:bg-white even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {doc.seriesYear}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {doc.title}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {doc.category}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {format(doc.dateApproved, "MMMM dd, yyyy")}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <Link href={`/resolutions/${doc.id}`}>
                    <Eye className="h-5 w-5 text-blue-500 hover:text-blue-700 cursor-pointer" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
