import { SignJWT, jwtVerify } from 'jose';

// Refuse to boot in production without a real secret — a known fallback would let
// anyone forge admin sessions.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nsib-dev-only-secret-not-for-production'
);

export const SESSION_COOKIE = 'nsib_token';
export const PRE_COOKIE = 'nsib_pre'; // short-lived token between password check and 2FA

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  typ?: 'session' | 'pre';
  iat?: number;
  exp?: number;
}

type CorePayload = Omit<JWTPayload, 'iat' | 'exp' | 'typ'>;

const isProd = process.env.NODE_ENV === 'production';

export const sessionCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
};

export const preCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 60 * 10, // 10 minutes
  path: '/',
};

// Full session — issued only AFTER the 2FA step.
export async function signToken(payload: CorePayload): Promise<string> {
  return new SignJWT({ ...payload, typ: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Pre-auth — issued after password check, accepted only by the 2FA endpoints.
export async function signPreAuthToken(payload: CorePayload): Promise<string> {
  return new SignJWT({ ...payload, typ: 'pre' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(JWT_SECRET);
}

// Verifies a full session token. Rejects pre-auth tokens so they can never authenticate a route.
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const p = payload as unknown as JWTPayload;
    return p.typ === 'session' ? p : null;
  } catch {
    return null;
  }
}

export async function verifyPreAuthToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const p = payload as unknown as JWTPayload;
    return p.typ === 'pre' ? p : null;
  } catch {
    return null;
  }
}

export function getCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  return getCookie(cookieHeader, SESSION_COOKIE);
}
