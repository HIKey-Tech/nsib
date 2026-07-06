import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { clampInt } from '@/lib/params';

export const dynamic = 'force-dynamic';


const REPORT_FIELDS = `id, report_no, sector, type, report_status, operator, reg_no,
  vehicle_type, train_name, occurrence, title, description,
  file_url, file_name, file_size, cover_image_url, published_at, created_at, status, uploader_name`;

const VALID_SECTORS = new Set(['aviation', 'maritime', 'railway', 'other']);

// GET /api/reports - list reports. Public sees only published; authed sees all.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('type'); // filters by sector (aviation|maritime|railway)
  const page = clampInt(searchParams.get('page'), 1, 100_000);
  const limit = clampInt(searchParams.get('limit'), 20, 100);
  const offset = (page - 1) * limit;

  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;

  const where: string[] = [];
  const vals: unknown[] = [];
  if (!payload) {
    // Public: only published reports
    vals.push('published');
    where.push(`status = $${vals.length}`);
  } else if (payload.role === 'staff') {
    // Staff: only their own submissions (any status)
    vals.push(payload.userId);
    where.push(`uploaded_by = $${vals.length}`);
  }
  // Admin: sees everything — no filter added
  if (sector) {
    vals.push(sector);
    where.push(`sector = $${vals.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const reports = await query(
      `SELECT ${REPORT_FIELDS} FROM reports ${whereSql}
        ORDER BY published_at DESC, created_at DESC
        LIMIT $${vals.length + 1} OFFSET $${vals.length + 2}`,
      [...vals, limit, offset]
    );
    const countRows = await query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM reports ${whereSql}`,
      vals
    );
    return NextResponse.json({ reports, total: countRows[0].count });
  } catch (err) {
    console.error('Reports fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST /api/reports - create a report. Admin → published immediately. Staff → draft pending approval.
export async function POST(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      report_no, sector, operator, reg_no, vehicle_type, train_name, occurrence,
      report_status, description, file_url, file_name, file_size, cover_image_url, published_at, type,
    } = body;

    if (!sector || !VALID_SECTORS.has(sector)) {
      return NextResponse.json({ error: 'A valid sector is required' }, { status: 400 });
    }
    // Preliminary reports are often filed before a report number has been assigned.
    const isPreliminary = report_status === 'Preliminary Report';
    if (!isPreliminary && (!report_no || !String(report_no).trim())) {
      return NextResponse.json({ error: 'Report No. is required' }, { status: 400 });
    }
    if (!occurrence) {
      return NextResponse.json({ error: 'Occurrence is required' }, { status: 400 });
    }
    if (!file_url) {
      return NextResponse.json({ error: 'A report file is required' }, { status: 400 });
    }

    // Admin → published straight away. Staff → draft awaiting admin approval.
    const status = payload.role === 'admin' ? 'published' : 'draft';
    const releasedAt = published_at || new Date().toISOString();
    const title = operator ? `${operator} — ${occurrence}` : occurrence;

    let saved;
    try {
      const rows = await query(
        `INSERT INTO reports
           (report_no, sector, type, report_status, operator, reg_no, vehicle_type,
            train_name, occurrence, title, description, file_url, file_name, file_size,
            cover_image_url, published_at, status, uploaded_by, uploader_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING ${REPORT_FIELDS}`,
        [
          // Preliminary reports never carry a number — NULLs bypass the unique index, so any count can coexist.
          isPreliminary ? null : String(report_no).trim(), sector, type || 'final', report_status ?? null, operator ?? null,
          reg_no ?? null, vehicle_type ?? null, train_name ?? null, occurrence, title,
          description ?? null, file_url, file_name ?? null, file_size ?? null,
          cover_image_url ?? null, releasedAt, status, payload.userId, payload.email,
        ]
      );
      saved = rows[0];
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === '23505') {
        return NextResponse.json({ error: 'That Report No. already exists. Please use a unique number.' }, { status: 409 });
      }
      throw e;
    }

    return NextResponse.json({ report: saved }, { status: 201 });
  } catch (err) {
    console.error('Report creation error:', err);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}
