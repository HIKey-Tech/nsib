import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  getCookie, verifyPreAuthToken, signToken,
  PRE_COOKIE, SESSION_COOKIE, sessionCookieOptions,
} from '@/lib/auth';
import { verifyTotp, generateBackupCodes } from '@/lib/totp';

// POST /api/auth/2fa/activate — confirm the first code, enable 2FA, start the session.
export async function POST(request: NextRequest) {
  const token = getCookie(request.headers.get('cookie'), PRE_COOKIE);
  const payload = token ? await verifyPreAuthToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
  }

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

  const rows = await query<{ totp_secret: string | null; totp_enabled: boolean }>(
    'SELECT totp_secret, totp_enabled FROM users WHERE id = $1 LIMIT 1',
    [payload.userId]
  );
  const user = rows[0];
  if (!user?.totp_secret) {
    return NextResponse.json({ error: 'Start setup again' }, { status: 400 });
  }
  if (!(await verifyTotp(user.totp_secret, String(code)))) {
    return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 });
  }

  const { plain, hashed } = generateBackupCodes();
  await query(
    'UPDATE users SET totp_enabled = true, backup_codes = $1 WHERE id = $2',
    [hashed, payload.userId]
  );

  const session = await signToken({ userId: payload.userId, email: payload.email, role: payload.role });
  const response = NextResponse.json({ backupCodes: plain });
  response.cookies.set(SESSION_COOKIE, session, sessionCookieOptions);
  response.cookies.set(PRE_COOKIE, '', { path: '/', expires: new Date(0) });
  return response;
}
