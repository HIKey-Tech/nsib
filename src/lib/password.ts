import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

// scrypt (Node stdlib) — no external dependency. Stored as `saltHex:hashHex`.
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const hash = Buffer.from(hashHex, 'hex');
  const test = scryptSync(password, Buffer.from(saltHex, 'hex'), hash.length);
  return hash.length === test.length && timingSafeEqual(hash, test);
}
