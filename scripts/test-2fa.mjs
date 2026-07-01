import { generate } from 'otplib';

const BASE = 'http://localhost:3000';
let jar = {};

function setCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    const name = pair.slice(0, i);
    const val = pair.slice(i + 1);
    if (val === '') delete jar[name];
    else jar[name] = val;
  }
}
function cookieHeader() {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
}
async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: cookieHeader() },
    body: body ? JSON.stringify(body) : undefined,
  });
  setCookies(res);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
async function get(path) {
  const res = await fetch(BASE + path, { headers: { cookie: cookieHeader() } });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exit(1); } console.log('  ok:', msg); };

const email = `t${Date.now()}@nsib.gov.ng`;

console.log('1. register');
let r = await post('/api/auth/register', { email, password: 'test1234', full_name: 'Tester' });
assert(r.status === 200 && r.data.needsEnrollment, 'register returns needsEnrollment');
assert(jar['nsib_pre'] && !jar['nsib_token'], 'pre cookie set, no session yet');

console.log('2. me before 2FA → should be unauthorized');
r = await get('/api/auth/me');
assert(r.status === 401, 'me is 401 before 2FA');

console.log('3. setup');
r = await post('/api/auth/2fa/setup');
assert(r.status === 200 && r.data.secret && r.data.qr.startsWith('data:image'), 'setup returns secret + QR');
const secret = r.data.secret;

console.log('4. activate with wrong code → rejected');
r = await post('/api/auth/2fa/activate', { code: '000000' });
assert(r.status === 400, 'wrong code rejected');

console.log('5. activate with real code');
let token = await generate({ secret });
r = await post('/api/auth/2fa/activate', { code: token });
assert(r.status === 200 && Array.isArray(r.data.backupCodes) && r.data.backupCodes.length === 8, 'activate returns 8 backup codes');
assert(jar['nsib_token'], 'session cookie now set');
const backup = r.data.backupCodes[0];

console.log('6. me after activation → authorized');
r = await get('/api/auth/me');
assert(r.status === 200 && r.data.user.email === email, 'me returns the user');

console.log('7. authed action (create news) works with session');
r = await post('/api/news', { title: '2FA works', excerpt: 'session valid' });
assert(r.status === 201, 'authed create news works');

console.log('8. fresh login → needs2fa');
jar = {};
r = await post('/api/auth/login', { email, password: 'test1234' });
assert(r.status === 200 && r.data.needs2fa, 'login returns needs2fa');
assert(jar['nsib_pre'] && !jar['nsib_token'], 'only pre cookie after password');

console.log('9. verify with TOTP');
token = await generate({ secret });
r = await post('/api/auth/2fa/verify', { code: token });
assert(r.status === 200 && r.data.ok, 'verify succeeds');
assert(jar['nsib_token'], 'session issued after verify');

console.log('10. login again → verify with a BACKUP code (one-time)');
jar = {};
await post('/api/auth/login', { email, password: 'test1234' });
r = await post('/api/auth/2fa/verify', { code: backup });
assert(r.status === 200 && r.data.ok, 'backup code accepted');

console.log('11. same backup code cannot be reused');
jar = {};
await post('/api/auth/login', { email, password: 'test1234' });
r = await post('/api/auth/2fa/verify', { code: backup });
assert(r.status === 400, 'reused backup code rejected');

console.log('12. wrong password → 401, no pre cookie');
jar = {};
r = await post('/api/auth/login', { email, password: 'wrongpass' });
assert(r.status === 401 && !jar['nsib_pre'], 'bad password rejected');

console.log('\nALL 2FA TESTS PASSED');
