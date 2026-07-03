import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  getCookie, verifyPreAuthToken, signToken,
  PRE_COOKIE, SESSION_COOKIE, sessionCookieOptions,
} from '@/lib/auth';
import { verifyTotp, hashBackupCode } from '@/lib/totp';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// POST /api/auth/2fa/verify — second-factor check at login. Accepts a TOTP code or a backup code.
export async function POST(request: NextRequest) {
  // A 6-digit TOTP is guessable if unthrottled — 10 attempts per 15 minutes per IP.
  if (!rateLimit(`2fa:${clientIp(request)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const token = getCookie(request.headers.get('cookie'), PRE_COOKIE);
  const payload = token ? await verifyPreAuthToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
  }

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

  const rows = await query<{ totp_secret: string | null; backup_codes: string[] }>(
    'SELECT totp_secret, backup_codes FROM users WHERE id = $1 AND totp_enabled = true LIMIT 1',
    [payload.userId]
  );
  const user = rows[0];
  if (!user?.totp_secret) {
    return NextResponse.json({ error: 'Two-factor is not set up' }, { status: 400 });
  }

  let ok = await verifyTotp(user.totp_secret, String(code));

  // Fall back to a one-time backup code, consuming it on use.
  if (!ok) {
    const h = hashBackupCode(String(code));
    if (user.backup_codes.includes(h)) {
      ok = true;
      const remaining = user.backup_codes.filter((c) => c !== h);
      await query('UPDATE users SET backup_codes = $1 WHERE id = $2', [remaining, payload.userId]);
    }
  }

  if (!ok) {
    return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 });
  }

  const session = await signToken({ userId: payload.userId, email: payload.email, role: payload.role });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, session, sessionCookieOptions);
  response.cookies.set(PRE_COOKIE, '', { path: '/', expires: new Date(0) });
  return response;
}
