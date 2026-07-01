import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteUpload } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

// PATCH /api/reports/[id] — approve (publish) a draft report. Admin only.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    const rows = await query(
      `UPDATE reports SET status = 'published', updated_at = now()
       WHERE id = $1 AND status = 'draft'
       RETURNING id, status`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Draft not found or already published' }, { status: 404 });
    }
    return NextResponse.json({ report: rows[0] });
  } catch (err) {
    console.error('Report approve error:', err);
    return NextResponse.json({ error: 'Failed to approve report' }, { status: 500 });
  }
}

// DELETE /api/reports/[id]
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

  const rows = await query<{ file_url: string | null }>(
    'SELECT file_url FROM reports WHERE id = $1 LIMIT 1',
    [id]
  );
  const report = rows[0];

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  try {
    await query('DELETE FROM reports WHERE id = $1', [id]);
    await deleteUpload(report.file_url);
    return NextResponse.json({ message: 'Report deleted' });
  } catch (err) {
    console.error('Report delete error:', err);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
