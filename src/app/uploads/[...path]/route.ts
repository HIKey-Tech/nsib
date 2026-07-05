import { NextRequest } from 'next/server';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import path from 'path';

// The standalone production server only serves public/ files that existed at
// build time, so runtime uploads under public/uploads 404 without this route.
// It streams them from disk instead.

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

// Only types saveUpload can produce. Anything else downloads as octet-stream,
// which (with the site-wide nosniff header) browsers will never render inline.
const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.txt': 'text/plain; charset=utf-8',
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;

  // saveUpload sanitises names to [a-zA-Z0-9._-]; enforce the same here so no
  // crafted URL (.., %2e%2e, etc.) can escape the upload root.
  if (!segments?.length || segments.some((s) => !/^[a-zA-Z0-9._-]+$/.test(s) || s.includes('..'))) {
    return new Response('Not found', { status: 404 });
  }

  const full = path.join(UPLOAD_ROOT, ...segments);
  if (!full.startsWith(UPLOAD_ROOT + path.sep)) {
    return new Response('Not found', { status: 404 });
  }

  let info;
  try {
    info = await stat(full);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  if (!info.isFile()) return new Response('Not found', { status: 404 });

  const type = MIME[path.extname(full).toLowerCase()] ?? 'application/octet-stream';
  return new Response(Readable.toWeb(createReadStream(full)) as ReadableStream, {
    headers: {
      'Content-Type': type,
      'Content-Length': String(info.size),
      // Filenames are timestamp-prefixed and never reused, so long cache is safe.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
