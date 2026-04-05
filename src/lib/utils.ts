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
