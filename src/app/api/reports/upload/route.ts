import { NextRequest, NextResponse } from 'next/server';
import { saveUpload } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

// POST /api/reports/upload - store a report file on the server's disk
export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookie(cookieHeader);
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Both staff and admin can upload files.

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - allow PDF, Word, Excel, images
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed. Please upload PDF, Word, Excel, or image files.' }, { status: 400 });
    }

    // No size cap: this route only serves local-disk uploads. The Supabase path
    // uploads directly via signed URL and is bounded by the bucket's own limit.
    const saved = await saveUpload('reports', file);

    return NextResponse.json({
      url: saved.url,
      path: saved.url,
      name: saved.name,
      size: saved.size,
      type: saved.type,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
