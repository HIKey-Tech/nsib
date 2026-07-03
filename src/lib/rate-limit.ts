// ponytail: in-memory fixed-window limiter — right for a single Node instance;
// swap for Redis if the site ever runs more than one instance.
const hits = new Map<string, { count: number; resetAt: number }>();

/** Returns true if the caller is within `max` hits per `windowMs` for this key. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  // Keep the map bounded: sweep expired entries once it grows large.
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

/** Best-effort client IP — first hop of x-forwarded-for (set by the reverse proxy). */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
