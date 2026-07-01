import { NextRequest, NextResponse } from 'next/server';
import { saveUpload } from '@/lib/storage';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, or GIF images are allowed.' }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: 'Image too large. Maximum size is 10MB.' }, { status: 400 });

    const saved = await saveUpload('event-flyers', file);
    return NextResponse.json({ url: saved.url, name: saved.name, size: saved.size });
  } catch (err) {
    console.error('Event flyer upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
