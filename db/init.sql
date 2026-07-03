-- =============================================================
-- NSIB Portal — Postgres schema (source of truth)
-- Auto-loaded by docker-compose on first boot of an empty DB.
-- gen_random_uuid() is built into Postgres 13+; no extension needed.
-- =============================================================

-- Users — JWT auth, SHA-256(password + 'nsib_salt') hashes
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'staff'
                            CHECK (role IN ('staff', 'admin')),
  totp_secret   TEXT,
  totp_enabled  BOOLEAN     NOT NULL DEFAULT false,
  backup_codes  TEXT[]      NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  type          TEXT        NOT NULL DEFAULT 'final'
                            CHECK (type IN ('preliminary', 'final', 'interim', 'safety_bulletin')),
  sector        TEXT        NOT NULL
                            CHECK (sector IN ('aviation', 'maritime', 'railway', 'other')),
  description   TEXT,
  status        TEXT        NOT NULL DEFAULT 'published'
                            CHECK (status IN ('draft', 'published', 'archived')),
  file_url      TEXT        NOT NULL,
  file_name     TEXT,
  file_size     BIGINT,
  cover_image_url TEXT,                              -- optional; UI falls back to NSIB logo
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now(),  -- DATE OF RELEASE
  uploaded_by   UUID        REFERENCES users(id) ON DELETE SET NULL,
  uploader_name TEXT,
  -- Per-category public fields (client schema: air / marine / rail)
  report_no     TEXT,                 -- auto-generated, e.g. NSIB/AIR/2026/001
  operator      TEXT,                 -- aircraft operator / operator / train operator
  reg_no        TEXT,                 -- reg no / vessel-craft no
  vehicle_type  TEXT,                 -- aircraft type / vessel type / train type
  train_name    TEXT,                 -- rail only
  occurrence    TEXT,
  report_status TEXT,                 -- public STATUS (Preliminary/Interim/Final/Safety Advisory)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_sector_idx       ON reports (sector);
CREATE INDEX IF NOT EXISTS reports_status_idx       ON reports (status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx   ON reports (created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS reports_report_no_key ON reports (report_no);

-- News
CREATE TABLE IF NOT EXISTS news (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  excerpt      TEXT        NOT NULL,
  content      TEXT        NOT NULL DEFAULT '',
  category     TEXT        NOT NULL DEFAULT 'general',
  image_url    TEXT,
  status       TEXT        NOT NULL DEFAULT 'published'
                           CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  author_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  author_name  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS news_status_idx       ON news (status);
CREATE INDEX IF NOT EXISTS news_published_at_idx ON news (published_at DESC);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  description       TEXT        NOT NULL DEFAULT '',
  event_date        TIMESTAMPTZ NOT NULL,
  end_date          TIMESTAMPTZ,
  location          TEXT        NOT NULL DEFAULT '',
  category          TEXT        NOT NULL DEFAULT 'general',
  image_url         TEXT,
  registration_link TEXT,
  status            TEXT        NOT NULL DEFAULT 'published'
                                CHECK (status IN ('draft', 'published', 'archived')),
  organizer_name    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_status_idx     ON events (status);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON events (event_date);

-- Publications — admin-uploaded documents (legislation, mou, form, manual, foi, general)
CREATE TABLE IF NOT EXISTS publications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  category      TEXT        NOT NULL CHECK (category IN ('legislation','mou','form','manual','foi','general')),
  reference_no  TEXT,
  description   TEXT,
  status        TEXT,
  file_url      TEXT        NOT NULL,
  file_name     TEXT,
  file_size     BIGINT,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by   UUID        REFERENCES users(id) ON DELETE SET NULL,
  uploader_name TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS publications_category_idx     ON publications (category);
CREATE INDEX IF NOT EXISTS publications_published_at_idx ON publications (published_at DESC);

-- Trainings — admin-created courses/trainings shown on the Learning Portal
CREATE TABLE IF NOT EXISTS trainings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  description    TEXT,
  venue          TEXT,
  category       TEXT        NOT NULL DEFAULT 'general'
                             CHECK (category IN ('aviation', 'maritime', 'railway', 'general')),
  start_date     TIMESTAMPTZ NOT NULL,
  end_date       TIMESTAMPTZ,
  status         TEXT        NOT NULL DEFAULT 'published',
  created_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
  organizer_name TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS trainings_start_idx ON trainings (start_date);

-- Training registrations — public enrolments; admin views the roster
CREATE TABLE IF NOT EXISTS training_registrations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id  UUID        NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  full_name    TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  phone        TEXT,
  organization TEXT,
  location     TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS training_regs_training_idx ON training_registrations (training_id);

-- Analytics — one row per tracked event (page view, news view, report download)
CREATE TABLE IF NOT EXISTS analytics_events (
  id         BIGSERIAL   PRIMARY KEY,
  kind       TEXT        NOT NULL,   -- 'page' | 'news_view' | 'report_download'
  path       TEXT        NOT NULL,
  ref_id     UUID,                   -- news/report id when applicable
  session_id TEXT,                   -- first-party visitor cookie, for unique counts
  referrer   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_created_idx ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_kind_idx    ON analytics_events (kind);
CREATE INDEX IF NOT EXISTS analytics_ref_idx     ON analytics_events (ref_id);

-- Auto-touch updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- Upgrade section — brings databases created from an older version
-- of this file up to date. Every statement is idempotent, so this
-- whole file is safe to (re-)run against fresh AND existing DBs:
--   docker compose exec -T db psql -U nsib -d nsib < db/init.sql
-- =============================================================
ALTER TABLE reports ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_no       TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS operator        TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reg_no          TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS vehicle_type    TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS train_name      TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS occurrence      TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_status   TEXT;

-- Allow the "other" accident sector (older DBs have a 3-sector CHECK).
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_sector_check;
ALTER TABLE reports ADD  CONSTRAINT reports_sector_check
  CHECK (sector IN ('aviation', 'maritime', 'railway', 'other'));

CREATE OR REPLACE TRIGGER users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER news_updated_at    BEFORE UPDATE ON news    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER events_updated_at  BEFORE UPDATE ON events  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE OR REPLACE TRIGGER trainings_updated_at BEFORE UPDATE ON trainings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
