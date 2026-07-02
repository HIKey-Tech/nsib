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

// A pre-authorised target the browser uploads to directly, bypassing our API
// function (and Vercel's 4.5MB request-body limit). Only Supabase supports this;
// the local backend returns null so callers fall back to a normal POST.
export interface SignedUploadTarget {
  uploadUrl: string;  // absolute URL the client PUTs the file bytes to
  publicUrl: string;  // permanent public URL to persist in the DB
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

/**
 * Create a direct-upload target for the browser. Returns null when the active
 * backend can't issue one (local disk) — callers should then POST the file to
 * the normal upload route instead.
 */
export async function createSignedUploadUrl(subdir: string, filename: string): Promise<SignedUploadTarget | null> {
  const backend = getBackend();
  return backend.createSignedUploadUrl ? backend.createSignedUploadUrl(subdir, filename) : null;
}
