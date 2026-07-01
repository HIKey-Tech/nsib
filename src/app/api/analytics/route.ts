import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

// GET /api/analytics — aggregated site metrics for the last 30 days (authenticated).
export async function GET(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totals, byDay, topPages, topNews, topReports, sectorDownloads] = await Promise.all([
      query<{ views: number; unique_visitors: number; news_views: number; downloads: number }>(
        `SELECT
           count(*) FILTER (WHERE kind IN ('page','news_view'))::int AS views,
           count(DISTINCT session_id)::int                           AS unique_visitors,
           count(*) FILTER (WHERE kind = 'news_view')::int           AS news_views,
           count(*) FILTER (WHERE kind = 'report_download')::int     AS downloads
         FROM analytics_events
         WHERE created_at >= now() - interval '30 days'`
      ),
      query<{ day: string; count: number }>(
        `SELECT to_char(d::date, 'YYYY-MM-DD') AS day, COALESCE(c.count, 0)::int AS count
           FROM generate_series(now()::date - interval '29 days', now()::date, interval '1 day') d
           LEFT JOIN (
             SELECT date_trunc('day', created_at)::date AS day, count(*) AS count
               FROM analytics_events
              WHERE kind IN ('page','news_view') AND created_at >= now()::date - interval '29 days'
              GROUP BY 1
           ) c ON c.day = d::date
          ORDER BY d`
      ),
      query<{ path: string; count: number }>(
        `SELECT path, count(*)::int AS count
           FROM analytics_events
          WHERE kind = 'page' AND created_at >= now() - interval '30 days'
          GROUP BY path ORDER BY count DESC LIMIT 8`
      ),
      query<{ id: string; title: string; count: number }>(
        `SELECT n.id, n.title, count(*)::int AS count
           FROM analytics_events a JOIN news n ON n.id = a.ref_id
          WHERE a.kind = 'news_view' AND a.created_at >= now() - interval '30 days'
          GROUP BY n.id, n.title ORDER BY count DESC LIMIT 6`
      ),
      query<{ id: string; title: string; sector: string; count: number }>(
        `SELECT r.id, r.title, r.sector, count(*)::int AS count
           FROM analytics_events a JOIN reports r ON r.id = a.ref_id
          WHERE a.kind = 'report_download' AND a.created_at >= now() - interval '30 days'
          GROUP BY r.id, r.title, r.sector ORDER BY count DESC LIMIT 6`
      ),
      query<{ sector: string; count: number }>(
        `SELECT r.sector, count(*)::int AS count
           FROM analytics_events a JOIN reports r ON r.id = a.ref_id
          WHERE a.kind = 'report_download' AND a.created_at >= now() - interval '30 days'
          GROUP BY r.sector ORDER BY count DESC`
      ),
    ]);

    return NextResponse.json({
      totals: totals[0],
      byDay,
      topPages,
      topNews,
      topReports,
      sectorDownloads,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
