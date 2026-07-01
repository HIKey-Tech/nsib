// Asserts absolute counts — run against an empty analytics table:
//   docker compose exec -T db psql -U nsib -d nsib -c "TRUNCATE analytics_events, users, news, reports RESTART IDENTITY CASCADE;"
// Needs the dev server + docker db running.
import { generate } from 'otplib';

const BASE = 'http://localhost:3000';

function makeJar() {
  let jar = {};
  return {
    set(res) {
      for (const c of res.headers.getSetCookie?.() ?? []) {
        const [pair] = c.split(';');
        const i = pair.indexOf('=');
        const name = pair.slice(0, i), val = pair.slice(i + 1);
        if (val === '') delete jar[name]; else jar[name] = val;
      }
    },
    header() { return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; '); },
    get(k) { return jar[k]; },
  };
}
async function post(jar, path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: jar.header() },
    body: body ? JSON.stringify(body) : undefined,
  });
  jar.set(res);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
async function get(jar, path) {
  const res = await fetch(BASE + path, { headers: { cookie: jar.header() } });
  jar.set(res);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } console.log('  ok:', m); };

// --- Build an authenticated admin session (register + enroll 2FA) ---
const admin = makeJar();
const email = `an${Date.now()}@nsib.gov.ng`;
await post(admin, '/api/auth/register', { email, password: 'test1234', full_name: 'Analyst' });
let setup = await post(admin, '/api/auth/2fa/setup');
await post(admin, '/api/auth/2fa/activate', { code: await generate({ secret: setup.data.secret }) });
assert(admin.get('nsib_token'), 'admin session established');

// --- Seed content: one news item + one report ---
let r = await post(admin, '/api/news', { title: 'Analytics News', excerpt: 'x' });
const newsId = r.data.news.id;
r = await post(admin, '/api/reports', { title: 'Analytics Report', sector: 'aviation', file_url: '/uploads/reports/a.pdf' });
const reportId = r.data.report.id;
assert(newsId && reportId, 'seeded news + report');

// --- Simulate 3 distinct public visitors firing events ---
for (let v = 0; v < 3; v++) {
  const visitor = makeJar(); // fresh cookie jar = new unique visitor
  await post(visitor, '/api/track', { path: '/' });
  await post(visitor, '/api/track', { path: '/air-reports' });
  await post(visitor, '/api/track', { path: `/news/${newsId}` });        // classified as news_view
  await post(visitor, '/api/track', { path: '/air-reports', kind: 'report_download', refId: reportId });
}

// --- Query analytics ---
r = await get(admin, '/api/analytics');
assert(r.status === 200, 'analytics endpoint returns 200');
const a = r.data;
console.log('  totals:', JSON.stringify(a.totals));
assert(a.totals.views === 9, 'total page views = 9 (3 visitors x [/, /air-reports, news])');
assert(a.totals.unique_visitors === 3, 'unique visitors = 3');
assert(a.totals.news_views === 3, 'news views = 3');
assert(a.totals.downloads === 3, 'report downloads = 3');
assert(a.byDay.length === 30, 'byDay has 30 days');
assert(a.byDay[29].count === 9, "today's bucket = 9 page+news views");
assert(a.topPages.find((p) => p.path === '/air-reports')?.count === 3, 'top pages counts /air-reports = 3');
assert(a.topNews[0]?.title === 'Analytics News' && a.topNews[0].count === 3, 'top news joined by title, count 3');
assert(a.topReports[0]?.title === 'Analytics Report' && a.topReports[0].count === 3, 'top reports joined, count 3');
assert(a.sectorDownloads[0]?.sector === 'aviation' && a.sectorDownloads[0].count === 3, 'sector split = aviation 3');

// --- Analytics is protected ---
r = await get(makeJar(), '/api/analytics');
assert(r.status === 401, 'analytics requires auth');

console.log('\nALL ANALYTICS TESTS PASSED');
