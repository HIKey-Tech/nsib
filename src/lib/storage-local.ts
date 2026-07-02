import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import type { StoredFile } from './storage';

// Local-disk storage backend.
// Files live on the deployment server's disk, served statically by Next from /uploads.
const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

// Extensions that browsers execute/render in-origin — never store them under /uploads,
// where they'd be served same-origin and become stored XSS. file.type (MIME) is
// client-controlled, so the extension is the real defence.
const DANGEROUS_EXT = /\.(html?|xhtml|svg|xml|js|mjs|css|php\d?|phtml)$/i;

/** Save an uploaded File under public/uploads/<subdir>/ and return its public URL. */
export async function saveUpload(subdir: string, file: File): Promise<StoredFile> {
  let sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Neutralise executable/renderable extensions so uploads can only ever be downloaded.
  if (DANGEROUS_EXT.test(sanitized)) sanitized = sanitized.replace(DANGEROUS_EXT, '.txt');
  const filename = `${Date.now()}_${sanitized}`;
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${subdir}/${filename}`, name: file.name, size: file.size, type: file.type };
}

/** Local disk can't issue signed upload URLs — callers fall back to a normal POST. */
export async function createSignedUploadUrl(): Promise<null> {
  return null;
}

/** Delete a file previously saved via saveUpload. No-ops for non-local/foreign URLs. */
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/')) return;
  const full = path.join(UPLOAD_ROOT, url.slice('/uploads/'.length));
  // Guard against path traversal — never delete outside the upload root.
  if (full !== UPLOAD_ROOT && !full.startsWith(UPLOAD_ROOT + path.sep)) return;
  try {
    await unlink(full);
  } catch {
    /* already gone — fine */
  }
}
