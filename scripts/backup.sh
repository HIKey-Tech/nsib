#!/usr/bin/env bash
# NSIB nightly backup — for the VPS deployment (STORAGE_PROVIDER=local).
# Dumps Postgres + the uploaded files, keeps a rolling window, and (optionally)
# pushes a copy offsite. A backup only on the same disk as the data is not a backup.
#
# Usage:  ./scripts/backup.sh
# Cron :  15 2 * * *  cd /srv/nsib-site && ./scripts/backup.sh >> /var/log/nsib-backup.log 2>&1
set -euo pipefail

# ── Config (override via env) ────────────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-/srv/nsib-backups}"
UPLOADS_DIR="${UPLOADS_DIR:-$(pwd)/public/uploads}"
DB_SERVICE="${DB_SERVICE:-db}"          # docker compose service name
DB_USER="${DB_USER:-nsib}"
DB_NAME="${DB_NAME:-nsib}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
# Offsite: set OFFSITE_REMOTE to an rclone remote:path (e.g. "b2:nsib-backups").
# Leave empty to skip — but you should not leave it empty in production.
OFFSITE_REMOTE="${OFFSITE_REMOTE:-}"

stamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# ── 1. Database ──────────────────────────────────────────────────────────────
db_file="$BACKUP_DIR/db-$stamp.sql.gz"
docker compose exec -T "$DB_SERVICE" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$db_file"
echo "DB dumped   → $db_file ($(du -h "$db_file" | cut -f1))"

# ── 2. Uploaded files ────────────────────────────────────────────────────────
up_file="$BACKUP_DIR/uploads-$stamp.tar.gz"
if [ -d "$UPLOADS_DIR" ]; then
  tar czf "$up_file" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
  echo "Uploads     → $up_file ($(du -h "$up_file" | cut -f1))"
else
  echo "WARN: uploads dir $UPLOADS_DIR not found (using Supabase storage?) — skipping files."
fi

# ── 3. Prune old local copies ────────────────────────────────────────────────
find "$BACKUP_DIR" -name 'db-*.sql.gz'      -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +"$RETENTION_DAYS" -delete

# ── 4. Offsite copy (the part that saves you) ────────────────────────────────
if [ -n "$OFFSITE_REMOTE" ]; then
  rclone copy "$db_file" "$OFFSITE_REMOTE" && echo "Offsite     → $OFFSITE_REMOTE"
  [ -f "$up_file" ] && rclone copy "$up_file" "$OFFSITE_REMOTE"
else
  echo "WARN: OFFSITE_REMOTE unset — backup is local-only. Set it before going live."
fi

echo "Backup complete: $stamp"
