import "server-only";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "kkb_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";

export function isAuthConfigured(): boolean {
  return Boolean(ADMIN_PASSWORD_HASH && SESSION_SECRET.length >= 16);
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(SESSION_SECRET);
}

/**
 * A short fingerprint of the current admin password hash, embedded in every
 * issued session token and re-checked on verification. This gives sessions a
 * cheap revocation mechanism with no session store: rotating
 * ADMIN_PASSWORD_HASH (changing the password) automatically invalidates every
 * previously-issued session, since old tokens carry the old fingerprint.
 */
function passwordVersion(): string {
  return createHash("sha256").update(ADMIN_PASSWORD_HASH).digest("hex").slice(0, 16);
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) return false;
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  } catch {
    return false;
  }
}

export async function signSession(): Promise<string> {
  return new SignJWT({ role: "editor", pwv: passwordVersion() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !isAuthConfigured()) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "editor" && payload.pwv === passwordVersion();
  } catch {
    return false;
  }
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** True when the current request carries a valid editor session cookie. */
export async function isEditorRequest(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

// ---------------------------------------------------------------------------
// Login rate limiting (in-memory; per server instance — fine for one editor).
// ---------------------------------------------------------------------------
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000;

type Attempt = { count: number; first: number; lockedUntil: number };
const attempts = new Map<string, Attempt>();

export function rateLimitStatus(ip: string): { locked: boolean; retryAfterSec: number } {
  const a = attempts.get(ip);
  if (!a) return { locked: false, retryAfterSec: 0 };
  const now = Date.now();
  if (a.lockedUntil > now) {
    return { locked: true, retryAfterSec: Math.ceil((a.lockedUntil - now) / 1000) };
  }
  return { locked: false, retryAfterSec: 0 };
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now - a.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now, lockedUntil: 0 });
    return;
  }
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) a.lockedUntil = now + LOCKOUT_MS;
}

export function resetAttempts(ip: string): void {
  attempts.delete(ip);
}
