import { Pool } from 'pg';

// Single pool per process, cached across Next dev hot-reloads.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

// Without this, an error on an idle client (e.g. DB restart) crashes the whole process.
pool.on('error', (err) => console.error('Unexpected pg pool error:', err));

// Thin helper — returns rows directly. Always use $1, $2… params (never string-interpolate input).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
