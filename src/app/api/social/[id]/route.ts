import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteUpload } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FIELDS = `id, platform, url, title, description, thumbnail_url, status,
  published_at, created_at, uploader_name`;

const VALID_PLATFORMS = new Set([
  'twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'other',
]);

async function authed(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  return token ? verifyToken(token) : null;
}

// PATCH /api/social/[id] - edit a post's fields.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await authed(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const sets: string[] = [];
    const vals: unknown[] = [];
    const set = (col: string, val: unknown) => { vals.push(val); sets.push(`${col} = $${vals.length}`); };

    if (body.platform !== undefined) {
      if (!VALID_PLATFORMS.has(body.platform)) {
        return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
      }
      set('platform', body.platform);
    }
    if (body.url !== undefined) set('url', String(body.url).trim());
    if (body.title !== undefined) set('title', body.title ?? null);
    if (body.description !== undefined) set('description', body.description ?? null);
    if (body.thumbnail_url !== undefined) set('thumbnail_url', body.thumbnail_url ?? null);
    if (body.status !== undefined) set('status', body.status);

    if (!sets.length) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    vals.push(id);
    const rows = await query(
      `UPDATE social_posts SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING ${FIELDS}`,
      vals
    );
    if (!rows[0]) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ post: rows[0] });
  } catch (err) {
    console.error('Social post update error:', err);
    return NextResponse.json({ error: 'Failed to update social post' }, { status: 500 });
  }
}

// DELETE /api/social/[id] - remove a post and its stored thumbnail.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await authed(request);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const rows = await query<{ thumbnail_url: string | null }>(
      'DELETE FROM social_posts WHERE id = $1 RETURNING thumbnail_url',
      [id]
    );
    if (!rows[0]) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    await deleteUpload(rows[0].thumbnail_url);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Social post delete error:', err);
    return NextResponse.json({ error: 'Failed to delete social post' }, { status: 500 });
  }
}
