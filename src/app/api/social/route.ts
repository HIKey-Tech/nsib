import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { clampInt } from '@/lib/params';

export const dynamic = 'force-dynamic';

const FIELDS = `id, platform, url, title, description, thumbnail_url, status,
  published_at, created_at, uploader_name`;

const VALID_PLATFORMS = new Set([
  'twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'other',
]);

// GET /api/social - list posts. Public sees only published; authed sees all.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const limit = clampInt(searchParams.get('limit'), 20, 100);

  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;

  const where: string[] = [];
  const vals: unknown[] = [];
  if (!payload) {
    vals.push('published');
    where.push(`status = $${vals.length}`);
  }
  if (platform) {
    vals.push(platform);
    where.push(`platform = $${vals.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const posts = await query(
      `SELECT ${FIELDS} FROM social_posts ${whereSql}
        ORDER BY published_at DESC, created_at DESC
        LIMIT $${vals.length + 1}`,
      [...vals, limit]
    );
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('Social posts fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch social posts' }, { status: 500 });
  }
}

// POST /api/social - create a post. Staff and admin may post; published immediately.
export async function POST(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { platform, url, title, description, thumbnail_url, published_at } = body;

    if (!platform || !VALID_PLATFORMS.has(platform)) {
      return NextResponse.json({ error: 'A valid platform is required' }, { status: 400 });
    }
    if (!url || !String(url).trim()) {
      return NextResponse.json({ error: 'A post link is required' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO social_posts
         (platform, url, title, description, thumbnail_url, status, published_at, created_by, uploader_name)
       VALUES ($1,$2,$3,$4,$5,'published',$6,$7,$8)
       RETURNING ${FIELDS}`,
      [
        platform, String(url).trim(), title ?? null, description ?? null,
        thumbnail_url ?? null, published_at || new Date().toISOString(),
        payload.userId, payload.email,
      ]
    );
    return NextResponse.json({ post: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Social post create error:', err);
    return NextResponse.json({ error: 'Failed to save social post' }, { status: 500 });
  }
}
