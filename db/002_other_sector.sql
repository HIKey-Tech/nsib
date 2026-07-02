-- Migration 002 — allow the "other" accident sector on existing databases.
-- init.sql only runs on a fresh volume, so apply this once to any live DB.
--   docker compose exec -T db psql -U nsib -d nsib < db/002_other_sector.sql
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_sector_check;
ALTER TABLE reports ADD  CONSTRAINT reports_sector_check
  CHECK (sector IN ('aviation', 'maritime', 'railway', 'other'));
