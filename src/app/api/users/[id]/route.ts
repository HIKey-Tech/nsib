import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

const VALID_ROLES = ['staff', 'admin'];

// PATCH /api/users/[id] — change a user's role. Admin only.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { role } = await request.json();

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  // An admin cannot change their own role — prevents self-lockout.
  if (id === payload.userId) {
    return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
  }
  // Never remove the last admin from the system.
  if (role !== 'admin') {
    const admins = await query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin' AND id <> $1`,
      [id]
    );
    if (admins[0].count === 0) {
      return NextResponse.json({ error: 'Cannot demote the last remaining admin.' }, { status: 400 });
    }
  }

  try {
    const rows = await query(
      `UPDATE users SET role = $1, updated_at = now() WHERE id = $2
         RETURNING id, email, full_name, role, totp_enabled, created_at`,
      [role, id]
    );
    if (rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error('User update error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] — remove a user. Admin only.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromCookie(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  // Cannot delete yourself.
  if (id === payload.userId) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }
  // Cannot delete the last admin.
  const target = await query<{ role: string }>('SELECT role FROM users WHERE id = $1 LIMIT 1', [id]);
  if (target.length === 0) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  if (target[0].role === 'admin') {
    const admins = await query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin' AND id <> $1`,
      [id]
    );
    if (admins[0].count === 0) {
      return NextResponse.json({ error: 'Cannot delete the last remaining admin.' }, { status: 400 });
    }
  }

  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('User delete error:', err);
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
