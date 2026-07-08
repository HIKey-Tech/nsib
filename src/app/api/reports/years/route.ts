import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/reports/years?type=aviation — returns distinct years for a sector.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('type');

  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;

  const where: string[] = [];
  const vals: unknown[] = [];

  if (!payload) {
    vals.push('published');
    where.push(`status = $${vals.length}`);
  } else if (payload.role === 'staff') {
    vals.push(payload.userId);
    where.push(`uploaded_by = $${vals.length}`);
  }
  // Admin sees everything — no status filter

  if (sector) {
    vals.push(sector);
    where.push(`sector = $${vals.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const rows = await query<{ year: number }>(
      `SELECT DISTINCT EXTRACT(YEAR FROM published_at)::int AS year
       FROM reports ${whereSql}
       ORDER BY year DESC`,
      vals
    );
    return NextResponse.json({ years: rows.map((r) => String(r.year)) });
  } catch (err) {
    console.error('Reports years fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
}
