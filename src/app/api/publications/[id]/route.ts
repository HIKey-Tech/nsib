import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteUpload } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

// DELETE /api/publications/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Only admins may delete content.
  if (payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const rows = await query<{ file_url: string | null }>(
      'DELETE FROM publications WHERE id = $1 RETURNING file_url',
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }
    await deleteUpload(rows[0].file_url);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Publication delete error:', err);
    return NextResponse.json({ error: 'Failed to delete publication' }, { status: 500 });
  }
}
