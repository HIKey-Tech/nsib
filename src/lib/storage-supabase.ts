import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { StoredFile, SignedUploadTarget } from './storage';

// Supabase Storage backend (demo / staging use).
// Uploads go to a public Supabase Storage bucket called "uploads".
// Activate by setting STORAGE_PROVIDER=supabase in .env along with the credentials.

const DANGEROUS_EXT = /\.(html?|xhtml|svg|xml|js|mjs|css|php\d?|phtml)$/i;

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'STORAGE_PROVIDER is "supabase" but SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are missing from .env'
    );
  }

  _client = createClient(url, key);
  return _client;
}

const BUCKET = 'uploads';

/** Build the sanitised, collision-free storage path for an upload. */
function buildStoragePath(subdir: string, name: string): string {
  let sanitized = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (DANGEROUS_EXT.test(sanitized)) sanitized = sanitized.replace(DANGEROUS_EXT, '.txt');
  return `${subdir}/${Date.now()}_${sanitized}`;
}

/** Save an uploaded File to Supabase Storage and return its public URL. */
export async function saveUpload(subdir: string, file: File): Promise<StoredFile> {
  const storagePath = buildStoragePath(subdir, file.name);

  const client = getClient();

  const { error } = await client.storage
    .from(BUCKET)
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get the permanent public URL for this file.
  const { data } = client.storage.from(BUCKET).getPublicUrl(storagePath);

  return { url: data.publicUrl, name: file.name, size: file.size, type: file.type };
}

/**
 * Issue a signed URL the browser can PUT a file to directly, so large uploads
 * never pass through our serverless function (Vercel caps those at 4.5MB).
 */
export async function createSignedUploadUrl(subdir: string, filename: string): Promise<SignedUploadTarget> {
  const storagePath = buildStoragePath(subdir, filename);
  const client = getClient();

  const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(storagePath);
  if (error || !data) {
    throw new Error(`Could not create signed upload URL: ${error?.message ?? 'unknown error'}`);
  }

  // data.signedUrl may be relative to the storage endpoint — resolve to absolute.
  const uploadUrl = new URL(data.signedUrl, process.env.SUPABASE_URL).toString();
  const { data: pub } = client.storage.from(BUCKET).getPublicUrl(storagePath);

  return { uploadUrl, publicUrl: pub.publicUrl };
}

/** Delete a file previously uploaded to Supabase Storage. */
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url) return;

  // Extract the storage path from the full public URL.
  // Public URLs look like: https://<project>.supabase.co/storage/v1/object/public/uploads/<path>
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return; // Not a Supabase URL — no-op (could be an old local URL).

  const storagePath = decodeURIComponent(url.slice(idx + marker.length));

  const client = getClient();
  const { error } = await client.storage.from(BUCKET).remove([storagePath]);

  if (error) {
    console.error('Supabase delete failed:', error.message);
  }
}
