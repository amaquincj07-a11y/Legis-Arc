/**
 * Postgres DATE → YYYY-MM-DD string (never rely on JSON Date serialization).
 *
 * node-pg's default DATE parser builds a Date at local midnight. Using
 * getUTC* on that value shifts the calendar day in timezones east of UTC
 * (e.g. Dec 1 Asia/Manila → Nov 30). The pool DATE type parser returns
 * plain strings; Date/ISO fallbacks below stay timezone-safe.
 */
export function toDateOnlyString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // node-pg DATE = local midnight for that calendar day
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const raw = String(value ?? "").trim();

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (dateOnly) {
    return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  }

  // Explicit UTC midnight ISO → trust the stated calendar day
  const utcMidnight =
    /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.\d+)?(?:Z|[+-]00:00)?$/i.exec(raw);
  if (utcMidnight) {
    return `${utcMidnight[1]}-${utcMidnight[2]}-${utcMidnight[3]}`;
  }

  // Shifted local-midnight ISO (e.g. 2025-11-30T16:00:00.000Z in UTC+8)
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  throw new Error(`Invalid date value: ${String(value)}`);
}
