import { NextRequest, NextResponse } from 'next/server';
import { createSignedUploadUrl } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

// Mirrors the allow-list in /api/reports/upload — PDF, Word, Excel, images.
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

// POST /api/reports/upload-url - hand the browser a direct-to-storage upload URL.
// Only the tiny JSON request touches this function, so large files never hit
// Vercel's 4.5MB body limit. Returns { signed: false } when the backend is local
// disk, so the client falls back to a normal multipart POST.
export async function POST(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, contentType, subdir } = await request.json();

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'A filename is required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, Word, Excel, or image files.' },
        { status: 400 }
      );
    }

    const target = await createSignedUploadUrl(subdir === 'covers' ? 'covers' : 'reports', filename);
    if (!target) {
      return NextResponse.json({ signed: false });
    }
    return NextResponse.json({ signed: true, ...target });
  } catch (err) {
    console.error('Signed upload URL error:', err);
    return NextResponse.json({ error: 'Could not start upload' }, { status: 500 });
  }
}
