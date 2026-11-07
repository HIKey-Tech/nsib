import { cache } from 'react';

// The Safety Recommendations section of this website. The data lives in the separate Office of Safety
// Recommendations (OSR) app; these pages read its PUBLIC, read-only API on the server and render it with the
// website's own header, footer and styling. Only recommendations an authorised OSR user has published, and only the
// fields approved for release, ever come back from that API.
//
// Settings (runtime, in .env):
//   OSR_APP_URL   where the OSR app answers, e.g. https://osr.nsib.gov.ng. Unset = the section shows "unavailable".
//   OSR_SITE_KEY  optional shared key, same value as in the OSR app. All requests come from this one server, so the
//                 key exempts it from the OSR's per-address rate limit.

export class OsrUnavailable extends Error {}

function base(): string {
  return (process.env.OSR_APP_URL || '').replace(/\/$/, '');
}

/** Where staff and addressees sign in (e.g. https://osr.nsib.gov.ng). */
export function portalUrl(): string {
  return (process.env.NEXT_PUBLIC_OSR_PORTAL_URL || base()).replace(/\/$/, '');
}

/** GET a public OSR endpoint. Returns null on 404; throws OsrUnavailable if the OSR is unset, down or erroring. */
async function osrGet<T>(path: string, params?: URLSearchParams): Promise<T | null> {
  const root = base();
  if (!root) throw new OsrUnavailable('OSR_APP_URL is not set');
  const qs = params && params.toString() ? `?${params.toString()}` : '';
  const key = process.env.OSR_SITE_KEY;
  let res: Response;
  try {
    res = await fetch(`${root}${path}${qs}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: 'application/json', ...(key ? { 'x-osr-site-key': key } : {}) },
    });
  } catch (e) {
    throw new OsrUnavailable(e instanceof Error ? e.message : String(e));
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new OsrUnavailable(`OSR answered ${res.status} for ${path}`);
  return (await res.json()) as T;
}

// ───────────── shapes returned by the OSR public API (see the OSR app's src/lib/osr/public.ts) ─────────────

export interface PublicRec {
  ref_no: string;
  type: 'urgent' | 'report';
  type_label: string;
  mode: string;
  occurrence: { ref: string | null; date: string | null; location: string | null; registration: string | null; operator: string | null; title: string | null };
  recommendation: string;
  finding: string | null;
  addressee: { name: string; short_name: string | null };
  issued_at: string | null;
  response_due: string | null;
  /** days since issue while not closed; null once closed */
  days_outstanding: number | null;
  closed_at: string | null;
  stage: string;
  stage_label: string;
  response_state: string;
  response_state_label: string;
  status: { code: string; label: string };
  classification: { code: string; label: string } | null;
  themes: { code: string; label: string }[];
  global_concern: boolean;
  watchlist: { slug: string; title: string } | null;
  response_summary: string | null;
  report: { report_no: string | null; title: string | null; url: string | null } | null;
  published_at: string | null;
}

export interface PublicDocument { id: string; kind: string; name: string; size: number; url: string }
export interface Option { code: string; label: string }
export interface Facets {
  years: number[];
  addressees: { id: string; name: string; short_name: string | null }[];
  status: Option[];
  theme: Option[];
  classification: Option[];
}
export interface Stats {
  total: number;
  urgent: number;
  on_watchlist: number;
  watchlist_issues: number;
  per_year: { year: number; count: number }[];
  breakdown: Record<string, number>;
  by_addressee: { name: string; full_name: string; issued: number; responded: number; on_time: number; overdue_disclosed: number; response_rate: number }[];
  as_at: string;
}
export interface WatchlistItem { slug: string; title: string; mode: string | null; summary: string; total: number; open: number }
export interface WatchlistIssue { issue: { slug: string; title: string; mode: string | null; summary: string; content: string }; recommendations: PublicRec[] }

// ───────────── calls ─────────────

/** Filters are passed straight through (q, mode, year, addressee_id, status, theme, type, is_watchlist, global, report_no, page). */
export async function listRecommendations(params: URLSearchParams, limit: number) {
  const p = new URLSearchParams(params);
  p.set('limit', String(limit));
  const r = await osrGet<{ data: PublicRec[]; meta: { total: number; page: number; limit: number } }>('/api/osr/public/recommendations', p);
  return r ?? { data: [], meta: { total: 0, page: 1, limit } };
}

/** cache(): generateMetadata and the page share one request. */
export const getRecommendation = cache(async (ref: string) => {
  const r = await osrGet<{ data: PublicRec & { documents: PublicDocument[] } }>(`/api/osr/public/recommendations/${encodeURIComponent(ref)}`);
  return r?.data ?? null;
});

export async function getFacets(): Promise<Facets> {
  const r = await osrGet<{ data: Facets }>('/api/osr/public/facets');
  return r?.data ?? { years: [], addressees: [], status: [], theme: [], classification: [] };
}

export async function getStats(): Promise<Stats | null> {
  return (await osrGet<{ data: Stats }>('/api/osr/public/stats'))?.data ?? null;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  return (await osrGet<{ data: WatchlistItem[] }>('/api/osr/public/watchlist'))?.data ?? [];
}

export const getWatchlistIssue = cache(async (slug: string) => {
  return (await osrGet<{ data: WatchlistIssue }>(`/api/osr/public/watchlist/${encodeURIComponent(slug)}`))?.data ?? null;
});
