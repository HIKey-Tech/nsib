/** Parse a positive integer query param, clamped to [1, max]. NaN/garbage → fallback. */
export function clampInt(raw: string | null, fallback: number, max: number): number {
  const n = parseInt(raw ?? '', 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, 1), max);
}
