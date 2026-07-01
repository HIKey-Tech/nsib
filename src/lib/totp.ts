import { generateSecret as otpGenerateSecret, generateURI, verify } from 'otplib';
import { createHash, randomBytes } from 'crypto';

const ISSUER = 'NSIB Portal';

export function generateSecret(): string {
  return otpGenerateSecret();
}

/** otpauth:// URI to encode in the enrollment QR code. */
export function keyuri(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

// epochTolerance 30s ≈ ±1 time-step, covering clock drift between server and phone.
export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  try {
    const res = await verify({ secret, token: token.trim(), epochTolerance: 30 });
    return res.valid;
  } catch {
    return false;
  }
}

export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}

/** One-time recovery codes. Plaintext is shown to the user once; only hashes are stored. */
export function generateBackupCodes(count = 8): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  const hashed: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(5).toString('hex'); // 10 hex chars
    plain.push(code);
    hashed.push(hashBackupCode(code));
  }
  return { plain, hashed };
}
