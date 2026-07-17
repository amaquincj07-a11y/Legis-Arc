import { format } from "date-fns";

/**
 * Calendar-date helpers for session minutes.
 * Always treat session dates as YYYY-MM-DD (no timezone).
 * Never pass Postgres DATE / ISO midnight through Date.UTC formatting alone.
 */

/** Normalize any API/Date value to a plain YYYY-MM-DD calendar day. */
export function toCalendarDateString(value: string | Date): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    // Prefer the leading calendar day from ISO / date-only strings.
    // "2025-12-01T00:00:00.000Z" → "2025-12-01" (not local conversion).
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return toCalendarDateString(parsed);
    }
    throw new Error(`Invalid session date: ${value}`);
  }

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error("Invalid session date");
  }

  // node-pg DATE values are UTC midnight for that calendar day.
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local Date at noon for display-only formatting (never persist this). */
export function parseSessionDate(value: string | Date): Date {
  const ymd = toCalendarDateString(value);
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/** Value for `<input type="date">`. */
export function formatSessionDateInput(value: string | Date): string {
  return toCalendarDateString(value);
}

/** Human-readable label that cannot shift the calendar day. */
export function formatSessionDateDisplay(
  value: string | Date,
  pattern = "MMMM d, yyyy"
): string {
  return format(parseSessionDate(value), pattern);
}

export function sessionDateYear(value: string | Date): number {
  return Number(toCalendarDateString(value).slice(0, 4));
}

/** 0-based month (January = 0), matching date-fns getMonth. */
export function sessionDateMonthIndex(value: string | Date): number {
  return Number(toCalendarDateString(value).slice(5, 7)) - 1;
}

export function compareSessionDatesDesc(
  a: string | Date,
  b: string | Date
): number {
  return toCalendarDateString(b).localeCompare(toCalendarDateString(a));
}
