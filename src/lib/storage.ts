// Storage abstraction layer.
// Delegates to either local disk or Supabase Storage based on the STORAGE_PROVIDER env var.
//
// STORAGE_PROVIDER=local    → files saved to public/uploads/ on disk  (default)
// STORAGE_PROVIDER=supabase → files saved to a Supabase Storage bucket (demo mode)
//
// All API routes import from this module — they never talk to a backend directly.

export interface StoredFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

import * as local from './storage-local';
import * as supabase from './storage-supabase';

function getBackend() {
  const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
  if (provider === 'supabase') return supabase;
  return local;
}

/** Save an uploaded File and return its public URL. */
export async function saveUpload(subdir: string, file: File): Promise<StoredFile> {
  return getBackend().saveUpload(subdir, file);
}

/** Delete a file previously saved via saveUpload. */
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  return getBackend().deleteUpload(url);
}
