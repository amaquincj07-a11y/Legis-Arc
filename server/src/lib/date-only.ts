/**
 * Postgres DATE → YYYY-MM-DD string (never rely on JSON Date serialization).
 */
export function toDateOnlyString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const raw = String(value ?? "").trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  throw new Error(`Invalid date value: ${String(value)}`);
}
