import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';


const CATEGORIES = new Set(['legislation', 'mou', 'form', 'manual', 'foi', 'general']);
const FIELDS = `id, title, category, reference_no, description, status,
  file_url, file_name, file_size, published_at, created_at, uploader_name`;

// GET /api/publications?category=&page=&limit= — public list, newest first.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const vals: unknown[] = [];
  if (category && CATEGORIES.has(category)) {
    vals.push(category);
    where.push(`category = $${vals.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const publications = await query(
      `SELECT ${FIELDS} FROM publications ${whereSql}
        ORDER BY published_at DESC, created_at DESC
        LIMIT $${vals.length + 1} OFFSET $${vals.length + 2}`,
      [...vals, limit, offset]
    );
    const countRows = await query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM publications ${whereSql}`,
      vals
    );
    return NextResponse.json({ publications, total: countRows[0].count });
  } catch (err) {
    console.error('Publications fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch publications' }, { status: 500 });
  }
}

// POST /api/publications — create a publication (authenticated).
export async function POST(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Only admins may create content.
  if (payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, category, reference_no, description, status, file_url, file_name, file_size, published_at } = body;

    if (!title || !file_url) {
      return NextResponse.json({ error: 'Title and file are required' }, { status: 400 });
    }
    if (!category || !CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'A valid category is required' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO publications
         (title, category, reference_no, description, status, file_url, file_name, file_size,
          published_at, uploaded_by, uploader_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING ${FIELDS}`,
      [
        title, category, reference_no ?? null, description ?? null, status ?? null,
        file_url, file_name ?? null, file_size ?? null,
        published_at || new Date().toISOString(), payload.userId, payload.email,
      ]
    );
    return NextResponse.json({ publication: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Publication create error:', err);
    return NextResponse.json({ error: 'Failed to save publication' }, { status: 500 });
  }
}
