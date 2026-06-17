/** Format a percentage change with a leading "+" for gains: `+1.20%` / `-3.40%`. */
export function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

/** Coerce a Date, timestamp, or date string into a new Date instance. */
export function normalizeDate(input: Date | number | string): Date {
  if (input instanceof Date) {
    return new Date(input.getTime());
  }

  return new Date(input);
}
