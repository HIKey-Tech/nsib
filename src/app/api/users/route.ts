import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

const VALID_ROLES = ['staff', 'admin'];

// GET /api/users — list all users. Admin only.
export async function GET(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const users = await query(
      `SELECT id, email, full_name, role, totp_enabled, created_at
         FROM users ORDER BY created_at ASC`
    );
    return NextResponse.json({ users });
  } catch (err) {
    console.error('Users fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users — create a new user. Admin only.
export async function POST(request: NextRequest) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { email, password, full_name, role = 'staff' } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and full name are required.' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'A user with that email already exists.' }, { status: 409 });
    }

    const rows = await query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, totp_enabled, created_at`,
      [email.toLowerCase().trim(), hashPassword(password), full_name.trim(), role]
    );

    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('User create error:', err);
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}
