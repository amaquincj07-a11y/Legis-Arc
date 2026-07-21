import { format } from "date-fns";

/**
 * Calendar-date helpers for session minutes.
 * Always treat session dates as YYYY-MM-DD (no timezone).
 *
 * In Asia/Manila, node-pg DATE at local midnight Dec 1 serializes as
 * 2025-11-30T16:00:00.000Z — never use getUTC* alone for that value.
 */

/** Normalize any API/Date value to a plain YYYY-MM-DD calendar day. */
export function toCalendarDateString(value: string | Date): string {
  if (typeof value === "string") {
    const trimmed = value.trim();

    const exact = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (exact) {
      return `${exact[1]}-${exact[2]}-${exact[3]}`;
    }

    // Explicit UTC midnight ISO → trust the stated calendar day
    const utcMidnight =
      /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.\d+)?(?:Z|[+-]00:00)?$/i.exec(
        trimmed
      );
    if (utcMidnight) {
      return `${utcMidnight[1]}-${utcMidnight[2]}-${utcMidnight[3]}`;
    }

    // Shifted local-midnight ISO — recover the local calendar day
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return toCalendarDateString(parsed);
    }
    throw new Error(`Invalid session date: ${value}`);
  }

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error("Invalid session date");
  }

  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
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
