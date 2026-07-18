import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LegislativeDocument } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function splitSeriesNumber(doc: LegislativeDocument): {
  num: string;
  year: string;
} {
  const fullNumber = (doc.approvedNumber || doc.proposedNumber || "").trim();
  if (!fullNumber) {
    return { num: "", year: String(doc.seriesYear || "") };
  }
  const [yearPart, numPart] = fullNumber.split("-");
  if (!numPart) {
    return { num: "", year: yearPart || String(doc.seriesYear || "") };
  }
  return { num: numPart, year: yearPart };
}

/** e.g. MUN_ORD No 06-S 2025 / APP_ORD No 01-S 2025 */
export function formatOrdinanceNumber(doc: LegislativeDocument): string {
  const { num, year } = splitSeriesNumber(doc);
  const prefix = doc.ordinanceKind === "appropriation" ? "APP_ORD" : "MUN_ORD";
  if (!num) return year ? `${prefix} No __-S ${year}` : prefix;
  return `${prefix} No ${num}-S ${year}`;
}

/** e.g. RES No 12-S. 2025 */
export function formatResolutionNumber(doc: LegislativeDocument): string {
  const { num, year } = splitSeriesNumber(doc);
  if (!num) return year ? `RES No __-S. ${year}` : "RES";
  return `RES No ${num}-S. ${year}`;
}

export function formatSBMemberDisplayName(member: {
  name: string;
  position: string;
}): string {
  if (member.position === "SB Secretary") return member.name;
  if (member.position === "Vice Mayor") return `Vice Mayor ${member.name}`;
  return `Hon. ${member.name}`;
}

export function formatPeso(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? "-" : "";
  return `${sign}Php ${formatted}`;
}
