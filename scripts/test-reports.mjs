// Run against an empty DB:
//   docker compose exec -T db psql -U nsib -d nsib -c "TRUNCATE analytics_events, users, news, reports RESTART IDENTITY CASCADE;"
// Needs dev server + docker db.
import { generate } from 'otplib';

const BASE = 'http://localhost:3000';
function jar() {
  let j = {};
  return {
    set: (r) => { for (const c of r.headers.getSetCookie?.() ?? []) { const [p] = c.split(';'); const i = p.indexOf('='); const n = p.slice(0, i), v = p.slice(i + 1); if (v === '') delete j[n]; else j[n] = v; } },
    h: () => Object.entries(j).map(([k, v]) => `${k}=${v}`).join('; '),
    get: (k) => j[k],
  };
}
async function post(J, path, body) {
  const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: J.h() }, body: body ? JSON.stringify(body) : undefined });
  J.set(r); return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function get(J, path) {
  const r = await fetch(BASE + path, { headers: { cookie: J.h() } });
  J.set(r); return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function uploadFile(J) {
  const fd = new FormData();
  fd.append('file', new Blob([Buffer.from('%PDF-1.4 test')], { type: 'application/pdf' }), 'report.pdf');
  const r = await fetch(BASE + '/api/reports/upload', { method: 'POST', headers: { cookie: J.h() }, body: fd });
  J.set(r); return r.json();
}
const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } console.log('  ok:', m); };

const admin = jar();
const email = `rep${Date.now()}@nsib.gov.ng`;
await post(admin, '/api/auth/register', { email, password: 'test1234', full_name: 'Reporter' });
const s = await post(admin, '/api/auth/2fa/setup');
await post(admin, '/api/auth/2fa/activate', { code: await generate({ secret: s.data.secret }) });
assert(admin.get('nsib_token'), 'admin session established');

const year = new Date().getFullYear();

async function makeReport(fields) {
  const up = await uploadFile(admin);
  assert(up.url?.startsWith('/uploads/reports/'), 'file uploaded to disk');
  const r = await post(admin, '/api/reports', { ...fields, file_url: up.url, file_name: up.name, file_size: up.size });
  assert(r.status === 201, `report created (${fields.sector})`);
  return r.data.report;
}

console.log('1. aviation report stores supplied report no');
const air1 = await makeReport({ sector: 'aviation', report_no: `NSIB/AIR/${year}/001`, operator: 'Allied Air', reg_no: '5N-ABC', vehicle_type: 'B737', occurrence: 'Runway Excursion', report_status: 'Final Report' });
assert(air1.report_no === `NSIB/AIR/${year}/001`, `air1 report_no = NSIB/AIR/${year}/001 (got ${air1.report_no})`);
assert(air1.operator === 'Allied Air' && air1.reg_no === '5N-ABC' && air1.occurrence === 'Runway Excursion', 'air1 fields stored');

console.log('2. duplicate report no → 409');
let up = await uploadFile(admin);
let r = await post(admin, '/api/reports', { sector: 'aviation', report_no: `NSIB/AIR/${year}/001`, occurrence: 'Dup', report_status: 'Final Report', file_url: up.url });
assert(r.status === 409, 'duplicate report no rejected');

console.log('3. preliminary reports: no report no, any number can coexist');
const pre1 = await makeReport({ sector: 'aviation', report_no: 'Preliminary Report', operator: 'Max Air', occurrence: 'Bird Strike', report_status: 'Preliminary Report' });
assert(pre1.report_no === null, 'typed label discarded → report_no null');
const pre2 = await makeReport({ sector: 'aviation', operator: 'Air Peace', occurrence: 'Tail Strike', report_status: 'Preliminary Report' });
assert(pre2.report_no === null, 'second preliminary saves without collision');

console.log('4. maritime + railway fields stored');
const mar1 = await makeReport({ sector: 'maritime', report_no: `NSIB/MAR/${year}/001`, operator: 'NNPC Shipping', reg_no: 'IMO 9074729', vehicle_type: 'Tanker', occurrence: 'Grounding', report_status: 'Interim Statement' });
assert(mar1.report_no === `NSIB/MAR/${year}/001`, `mar1 report_no = NSIB/MAR/${year}/001 (got ${mar1.report_no})`);
const rail1 = await makeReport({ sector: 'railway', report_no: `NSIB/RAIL/${year}/001`, train_name: 'Lagos–Ibadan Express', operator: 'NRC', reg_no: 'NRC-01', vehicle_type: 'Passenger', occurrence: 'Derailment', report_status: 'Safety Advisory' });
assert(rail1.train_name === 'Lagos–Ibadan Express', 'rail train_name stored');

console.log('5. public list by sector (unauth) shows only that sector, published');
r = await get(jar(), '/api/reports?type=aviation');
assert(r.status === 200 && r.data.reports.length === 3 && r.data.reports.every((x) => x.sector === 'aviation'), 'public aviation list = 3');
assert(r.data.reports.some((x) => x.report_no) && r.data.reports.every((x) => x.occurrence), 'public list carries report_no + occurrence');

console.log('6. missing occurrence / missing report no (non-preliminary) → rejected');
up = await uploadFile(admin);
r = await post(admin, '/api/reports', { sector: 'aviation', report_no: 'X/1', file_url: up.url });
assert(r.status === 400, 'report without occurrence rejected');
r = await post(admin, '/api/reports', { sector: 'aviation', occurrence: 'No number', report_status: 'Final Report', file_url: up.url });
assert(r.status === 400, 'non-preliminary report without report no rejected');

console.log('7. download tracking → analytics');
const vis = jar();
await post(vis, '/api/track', { path: '/air-reports', kind: 'report_download', refId: air1.id });
await post(vis, '/api/track', { path: '/air-reports', kind: 'report_download', refId: air1.id });
await post(vis, '/api/track', { path: '/marine-reports', kind: 'report_download', refId: mar1.id });
r = await get(admin, '/api/analytics');
assert(r.data.totals.downloads === 3, 'analytics downloads = 3');
assert(r.data.topReports[0].id === air1.id && r.data.topReports[0].count === 2, 'top report = air1 with 2 downloads');
const av = r.data.sectorDownloads.find((x) => x.sector === 'aviation');
assert(av?.count === 2, 'sector split aviation = 2');

console.log('\nALL REPORTS TESTS PASSED');
