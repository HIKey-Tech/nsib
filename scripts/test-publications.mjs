// Run against an empty DB. Needs dev server + docker db.
import { generate } from 'otplib';
const BASE = 'http://localhost:3000';
function jar() { let j = {}; return {
  set: (r) => { for (const c of r.headers.getSetCookie?.() ?? []) { const [p] = c.split(';'); const i = p.indexOf('='); const n = p.slice(0, i), v = p.slice(i + 1); if (v === '') delete j[n]; else j[n] = v; } },
  h: () => Object.entries(j).map(([k, v]) => `${k}=${v}`).join('; '), get: (k) => j[k] }; }
async function post(J, path, body) { const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie: J.h() }, body: body ? JSON.stringify(body) : undefined }); J.set(r); return { status: r.status, data: await r.json().catch(() => ({})) }; }
async function del(J, path) { const r = await fetch(BASE + path, { method: 'DELETE', headers: { cookie: J.h() } }); J.set(r); return { status: r.status, data: await r.json().catch(() => ({})) }; }
async function get(J, path) { const r = await fetch(BASE + path, { headers: { cookie: J.h() } }); J.set(r); return { status: r.status, data: await r.json().catch(() => ({})) }; }
async function uploadPub(J) { const fd = new FormData(); fd.append('file', new Blob([Buffer.from('%PDF-1.4')], { type: 'application/pdf' }), 'doc.pdf'); const r = await fetch(BASE + '/api/publications/upload', { method: 'POST', headers: { cookie: J.h() }, body: fd }); J.set(r); return r.json(); }
const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } console.log('  ok:', m); };

const admin = jar();
const email = `pub${Date.now()}@nsib.gov.ng`;
await post(admin, '/api/auth/register', { email, password: 'test1234', full_name: 'Pub' });
const s = await post(admin, '/api/auth/2fa/setup');
await post(admin, '/api/auth/2fa/activate', { code: await generate({ secret: s.data.secret }) });
assert(admin.get('nsib_token'), 'admin session');

async function makePub(fields) { const up = await uploadPub(admin); assert(up.url?.startsWith('/uploads/publications/'), `file to /uploads/publications (${fields.category})`); const r = await post(admin, '/api/publications', { ...fields, file_url: up.url, file_name: up.name, file_size: up.size }); assert(r.status === 201, `publication created (${fields.category})`); return r.data.publication; }

console.log('1. create one of each category');
const p1 = await makePub({ title: 'NSIB Establishment Act 2022', category: 'legislation', reference_no: 'LEG/001/2026', status: 'In Force' });
await makePub({ title: 'MoU with Nigerian Navy', category: 'mou', status: 'Active' });
await makePub({ title: 'Aircraft Notification Form', category: 'form' });
await makePub({ title: 'Investigation Manual v3', category: 'manual' });
await makePub({ title: 'FOI Disclosure 2026', category: 'foi' });
await makePub({ title: 'General Bulletin', category: 'general' });

console.log('2. bad category rejected');
let up = await uploadPub(admin);
let r = await post(admin, '/api/publications', { title: 'X', category: 'bogus', file_url: up.url });
assert(r.status === 400, 'invalid category rejected');

console.log('3. public list + category filter');
r = await get(jar(), '/api/publications?limit=200');
assert(r.status === 200 && r.data.total === 6, `public list total = 6 (got ${r.data.total})`);
r = await get(jar(), '/api/publications?category=legislation');
assert(r.data.publications.length === 1 && r.data.publications[0].category === 'legislation', 'category filter works');
assert(r.data.publications[0].reference_no === 'LEG/001/2026', 'reference_no stored');

console.log('4. server-side pagination (limit=2)');
r = await get(jar(), '/api/publications?limit=2&page=1');
assert(r.data.publications.length === 2 && r.data.total === 6, 'page 1 returns 2 of 6');
r = await get(jar(), '/api/publications?limit=2&page=4');
assert(r.data.publications.length === 0, 'page 4 (beyond) returns 0');

console.log('5. delete (authed) + file cleanup path');
r = await del(admin, `/api/publications/${p1.id}`);
assert(r.status === 200, 'delete ok');
r = await get(jar(), '/api/publications?limit=200');
assert(r.data.total === 5, 'total now 5 after delete');

console.log('6. create requires auth');
up = { url: '/uploads/publications/x.pdf' };
r = await post(jar(), '/api/publications', { title: 'Nope', category: 'general', file_url: up.url });
assert(r.status === 401, 'unauth create rejected');

console.log('\nALL PUBLICATIONS TESTS PASSED');
