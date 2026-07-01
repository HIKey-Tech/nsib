import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { query } from '@/lib/db';
import { getCookie, verifyPreAuthToken, PRE_COOKIE } from '@/lib/auth';
import { generateSecret, keyuri } from '@/lib/totp';

// POST /api/auth/2fa/setup — generate a fresh TOTP secret + QR for an un-enrolled user.
export async function POST(request: NextRequest) {
  const token = getCookie(request.headers.get('cookie'), PRE_COOKIE);
  const payload = token ? await verifyPreAuthToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
  }

  const rows = await query<{ totp_enabled: boolean }>(
    'SELECT totp_enabled FROM users WHERE id = $1 LIMIT 1',
    [payload.userId]
  );
  if (!rows[0]) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (rows[0].totp_enabled) {
    return NextResponse.json({ error: 'Two-factor is already set up' }, { status: 400 });
  }

  // Store the secret now, but leave totp_enabled false until the first code is confirmed.
  const secret = generateSecret();
  await query('UPDATE users SET totp_secret = $1 WHERE id = $2', [secret, payload.userId]);

  const qr = await QRCode.toDataURL(keyuri(payload.email, secret));
  return NextResponse.json({ qr, secret });
}
