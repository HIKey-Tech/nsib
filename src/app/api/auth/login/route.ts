import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signPreAuthToken, PRE_COOKIE, preCookieOptions } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const rows = await query<{
      id: string; email: string; full_name: string; role: string;
      password_hash: string; totp_enabled: boolean;
    }>(
      'SELECT id, email, full_name, role, password_hash, totp_enabled FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    const user = rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Password OK — issue a pre-auth token; the real session comes after 2FA.
    const pre = await signPreAuthToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json(
      user.totp_enabled ? { needs2fa: true } : { needsEnrollment: true }
    );
    response.cookies.set(PRE_COOKIE, pre, preCookieOptions);
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
