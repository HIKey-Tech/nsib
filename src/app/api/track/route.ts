import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { query } from '@/lib/db';
import { getCookie } from '@/lib/auth';

// Public, fire-and-forget beacon. Always returns 204 so it never disrupts the page.
const KINDS = new Set(['page', 'news_view', 'report_download']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NEWS_PATH_RE = /^\/news\/([0-9a-f-]{36})$/i;

export async function POST(request: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  try {
    const { path, kind, refId, referrer } = await request.json();
    if (!path || typeof path !== 'string') return res;

    let k = KINDS.has(kind) ? kind : 'page';
    let rid: string | null = typeof refId === 'string' && UUID_RE.test(refId) ? refId : null;

    // Classify news detail views from the path so the client beacon stays dumb.
    const m = path.match(NEWS_PATH_RE);
    if (k === 'page' && m && UUID_RE.test(m[1])) {
      k = 'news_view';
      rid = m[1];
    }

    // First-party visitor id for rough unique-visitor counts. No PII.
    let vid = getCookie(request.headers.get('cookie'), 'nsib_vid');
    if (!vid) {
      vid = randomUUID();
      res.cookies.set('nsib_vid', vid, {
        httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/',
      });
    }

    await query(
      'INSERT INTO analytics_events (kind, path, ref_id, session_id, referrer) VALUES ($1, $2, $3, $4, $5)',
      [k, path.slice(0, 512), rid, vid, referrer ? String(referrer).slice(0, 512) : null]
    );
  } catch {
    /* never fail a page over analytics */
  }
  return res;
}
