import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  isAuthConfigured,
  verifyPassword,
  signSession,
  rateLimitStatus,
  recordFailure,
  resetAttempts,
} from "@/lib/auth";

/**
 * Resolves the client IP for rate-limiting. Trusts ONLY platform-injected
 * headers, never the raw client-supplied X-Forwarded-For — a request can set
 * that header to any value, which previously let an attacker get a fresh
 * rate-limit bucket on every login attempt just by changing it.
 *
 * `x-nf-client-connection-ip` is set by Netlify's edge from the real TCP
 * connection and cannot be overridden by the client. Locally (no Netlify
 * edge in front of `next dev`) neither header is trustworthy, so everything
 * shares one bucket — acceptable for local testing, and irrelevant once
 * actually deployed behind Netlify.
 */
function clientIp(req: NextRequest): string {
  return req.headers.get("x-nf-client-connection-ip") ?? "local";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  const rl = rateLimitStatus(ip);
  if (rl.locked) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in about ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` },
      { status: 429 },
    );
  }

  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Editing isn't set up yet. Add ADMIN_PASSWORD_HASH and SESSION_SECRET to enable login." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ok = await verifyPassword(password);
  if (!ok) {
    recordFailure(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  resetAttempts(ip);
  const token = await signSession();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}
