import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteUpload } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

const EDIT_FIELDS = `id, report_no, sector, type, report_status, operator, reg_no,
  vehicle_type, train_name, occurrence, title, description,
  file_url, file_name, file_size, published_at, created_at, status, uploader_name`;

// PATCH /api/reports/[id] — admin only.
//   No body (or {action:'publish'}) → approve a draft.
//   Body with fields → edit report_status / date and/or swap the uploaded file.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { report_status, published_at, file_url, file_name, file_size } = body;

  // No editable fields supplied → treat as "approve draft" (backward compatible).
  const hasEdits = report_status !== undefined || published_at !== undefined || file_url !== undefined;
  if (!hasEdits) {
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

  try {
    // If the file is being replaced, capture the old one so we can delete it after.
    let oldFileUrl: string | null = null;
    if (file_url !== undefined) {
      const cur = await query<{ file_url: string | null }>(
        'SELECT file_url FROM reports WHERE id = $1 LIMIT 1',
        [id]
      );
      if (cur.length === 0) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      oldFileUrl = cur[0].file_url;
    }

    const sets: string[] = [];
    const vals: unknown[] = [];
    const push = (col: string, val: unknown) => { vals.push(val); sets.push(`${col} = $${vals.length}`); };
    if (report_status !== undefined) push('report_status', report_status || null);
    if (published_at !== undefined) push('published_at', published_at);
    if (file_url !== undefined) {
      push('file_url', file_url);
      push('file_name', file_name ?? null);
      push('file_size', file_size ?? null);
    }
    vals.push(id);

    const rows = await query(
      `UPDATE reports SET ${sets.join(', ')}, updated_at = now()
       WHERE id = $${vals.length}
       RETURNING ${EDIT_FIELDS}`,
      vals
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    // Best-effort cleanup of the replaced file (never fail the request over it).
    if (oldFileUrl && oldFileUrl !== file_url) {
      await deleteUpload(oldFileUrl).catch(() => {});
    }
    return NextResponse.json({ report: rows[0] });
  } catch (err) {
    console.error('Report edit error:', err);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
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
