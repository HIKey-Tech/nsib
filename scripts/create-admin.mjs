// Create the first (or any) admin user directly in the database.
// No web registration required.
//
// Usage:
//   node scripts/create-admin.mjs <email> <password> <full_name>
//
// Example:
//   node scripts/create-admin.mjs admin@nsib.gov.ng "MySecret123" "Admin User"
//
// Reads DATABASE_URL from environment or the .env file automatically.

import { readFileSync } from 'node:fs';
import { scryptSync, randomBytes } from 'node:crypto';
import { Pool } from 'pg';

// ── helpers ──────────────────────────────────────────────────────────────────

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    const line = env.split('\n').find((l) => l.trim().startsWith('DATABASE_URL='));
    if (line) return line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
  } catch { /* no .env — fall through */ }
  return null;
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

// ── args ──────────────────────────────────────────────────────────────────────

const [email, password, fullName] = process.argv.slice(2);

if (!email || !password || !fullName) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> <full_name>');
  console.error('Example: node scripts/create-admin.mjs admin@nsib.gov.ng "MySecret123" "Admin User"');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const connectionString = databaseUrl();
if (!connectionString) {
  console.error('DATABASE_URL not set and not found in .env');
  process.exit(1);
}

// ── run ───────────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString });

try {
  const passwordHash = hashPassword(password);

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           full_name     = EXCLUDED.full_name,
           role          = 'admin',
           updated_at    = now()
     RETURNING id, email, full_name, role`,
    [email.toLowerCase().trim(), passwordHash, fullName.trim()]
  );

  const user = rows[0];
  console.log('');
  console.log('✔ Admin user ready:');
  console.log(`  Email     : ${user.email}`);
  console.log(`  Full name : ${user.full_name}`);
  console.log(`  Role      : ${user.role}`);
  console.log(`  ID        : ${user.id}`);
  console.log('');
  console.log('Next step: log in at /login and complete 2FA setup.');
  console.log('');
} catch (err) {
  console.error('Failed:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
