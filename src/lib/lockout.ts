import { query } from '@/lib/db';

// Per-account lockout, on top of the per-IP limiter: 5 consecutive failures lock the account for 15 minutes.
// The counter is cleared only when a full login (password AND second factor) completes, so retrying the
// password step cannot be used to reset the 2FA guess counter.
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

type LockTable = 'users';

export function isLocked(row: { locked_until?: string | Date | null } | undefined | null): boolean {
  return !!row?.locked_until && new Date(row.locked_until).getTime() > Date.now();
}

export async function registerFailure(table: LockTable, id: string): Promise<void> {
  await query(
    `UPDATE ${table}
        SET failed_logins = CASE WHEN failed_logins + 1 >= $2 THEN 0 ELSE failed_logins + 1 END,
            locked_until  = CASE WHEN failed_logins + 1 >= $2 THEN now() + ($3 || ' minutes')::interval ELSE locked_until END
      WHERE id = $1`,
    [id, MAX_FAILED_LOGINS, String(LOCK_MINUTES)]
  );
}

export async function clearFailures(table: LockTable, id: string): Promise<void> {
  await query(`UPDATE ${table} SET failed_logins = 0, locked_until = NULL WHERE id = $1`, [id]);
}
