import type { LegislativeDocument } from "@/lib/types";

export type AdminDocumentSort =
  | "recently_added"
  | "year_newest"
  | "year_oldest";

export const ADMIN_DOCUMENT_SORT_OPTIONS: {
  value: AdminDocumentSort;
  label: string;
}[] = [
  { value: "recently_added", label: "Recently Added" },
  { value: "year_newest", label: "Newest to Oldest Year" },
  { value: "year_oldest", label: "Oldest to Newest Year" },
];

function toTime(value: Date | string | undefined): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function seriesNumber(doc: LegislativeDocument): number {
  const full = doc.approvedNumber || doc.proposedNumber || "";
  const parts = full.split("-");
  const num = Number.parseInt(parts[1] ?? parts[0] ?? "", 10);
  return Number.isFinite(num) ? num : 0;
}

/** Sort ordinances/resolutions for admin lists. */
export function sortAdminDocuments(
  docs: LegislativeDocument[],
  sort: AdminDocumentSort
): LegislativeDocument[] {
  const sorted = [...docs];

  switch (sort) {
    case "year_newest":
      return sorted.sort((a, b) => {
        if (b.seriesYear !== a.seriesYear) return b.seriesYear - a.seriesYear;
        return seriesNumber(b) - seriesNumber(a);
      });
    case "year_oldest":
      return sorted.sort((a, b) => {
        if (a.seriesYear !== b.seriesYear) return a.seriesYear - b.seriesYear;
        return seriesNumber(a) - seriesNumber(b);
      });
    case "recently_added":
    default:
      return sorted.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));
  }
}
