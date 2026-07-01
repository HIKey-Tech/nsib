import { NextRequest, NextResponse } from 'next/server';
import { saveUpload } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

const ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_SIZE = 50 * 1024 * 1024;

// POST /api/publications/upload — store a publication document on disk.
export async function POST(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed. Upload PDF, Word, or Excel.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 });
    }

    const saved = await saveUpload('publications', file);
    return NextResponse.json({ url: saved.url, name: saved.name, size: saved.size, type: saved.type });
  } catch (err) {
    console.error('Publication upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
