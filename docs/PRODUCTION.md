# Go-live checklist

## Required environment (the app refuses to boot without the first one)

| Var | Notes |
|---|---|
| `JWT_SECRET` | **Must be set in production** — generate with `openssl rand -hex 32`. The app throws at startup if missing. |
| `DATABASE_URL` | Production Postgres. Do NOT reuse the docker-compose `nsib/nsib` credentials — set a strong password. |
| `NEXT_PUBLIC_SITE_URL` | Public domain (e.g. `https://nsib.gov.ng`). Drives canonical URLs, sitemap, robots, OG tags. |
| `STORAGE_PROVIDER` | `local` (files under `public/uploads`, needs a persistent volume) or `supabase` (+ `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). |
| `NODE_ENV` | `production` (set automatically by `next build` / `next start`). |

## Infrastructure

- Serve behind HTTPS (nginx/Caddy/managed platform). HSTS is already emitted by the app.
- The reverse proxy must set `x-forwarded-for` — the login/2FA rate limiter keys on it.
- Rate limiting is in-memory, per-process. Run **one** app instance, or move it to Redis if you scale out.
- Persistent volumes: Postgres data AND `public/uploads` (when `STORAGE_PROVIDER=local`).
- Schedule `scripts/backup.sh` (cron) and test a restore once.
- Cap request body size at the proxy (e.g. nginx `client_max_body_size 100m`) to match the app's 100MB upload cap.

## Office of Safety Recommendations (separate app)

The Office of Safety Recommendations is a **separate application** (its own repo `nsib-osr`, Docker stack, database
and logins) that shares this domain. The VPS web server routes `/safety-recommendations`, `/osr`, `/osr-portal`,
`/api/osr` and `/osr-assets` to it and everything else to this website — see `nsib-osr/docs/DEPLOY.md` and its
`deploy/Caddyfile.example` / `deploy/nginx.conf.example`. This site only links to it (menu, footer, homepage block,
"N safety recs" beside reports, via the OSR's public API); if the OSR is down those pieces hide themselves.
Optional fallback: build this app with `OSR_APP_URL=http://<host>:3001` to forward those paths itself.

## First boot

1. Run `db/init.sql` against the production DB — it is the single schema file, idempotent,
   and safe to re-run on an existing database (it upgrades older schemas in place).
2. Create the first admin: `node scripts/create-admin.mjs`.
3. Log in, complete 2FA enrolment, store the backup codes safely.

## After DNS goes live

- Submit `https://<domain>/sitemap.xml` in Google Search Console (verify the property first).
- Check `https://<domain>/robots.txt` renders with the right domain.
- Confirm security headers: `curl -sI https://<domain> | grep -iE 'strict-transport|x-frame|x-content|referrer'`.

## Known deliberate limits (upgrade paths noted in code)

- Rate limiter: in-memory, single-instance (`src/lib/rate-limit.ts`).
- Sitemap lists static routes + published news; reports/publications are listed on index pages only.
  Build with the DB reachable, or news entries only appear after the first hourly revalidation.
- OG image is the logo; replace with a designed 1200×630 image at `public/images/` and update
  `src/app/layout.tsx` when one exists.
