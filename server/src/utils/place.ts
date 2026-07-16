/** Normalize province/municipality keys to match DB + client place filters. */
export function normalizePlaceKey(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
}

export function decodePlaceParam(value: string): string {
  return normalizePlaceKey(decodeURIComponent(value));
}
