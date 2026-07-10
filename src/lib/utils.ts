import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LegislativeDocument } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOrdinanceNumber(doc: LegislativeDocument): string {
  const fullNumber = doc.approvedNumber || doc.proposedNumber;
  const [year, num] = fullNumber.split("-");
  const prefix = doc.ordinanceKind === "appropriation" ? "APPROPRIATION ORD" : "MUNICIPAL ORD";
  return `${prefix} No. ${num}-${year}`;
}

export function formatResolutionNumber(doc: LegislativeDocument): string {
  const fullNumber = doc.approvedNumber || doc.proposedNumber;
  const [year, num] = fullNumber.split("-");
  if (!num) return String(year ?? doc.seriesYear);
  return `${num}-${year}`;
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
