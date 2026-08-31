import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  expectedAdminToken,
  passwordMatches,
} from "@/lib/admin-auth";
import {
  checkLock,
  clearAttempts,
  clientIp,
  recordFailure,
} from "@/lib/login-throttle";

export const runtime = "nodejs";

const WEEK = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  const ip = clientIp(req);

  // Refuse outright while this address is locked out.
  const lock = await checkLock(ip);
  if (lock.locked) {
    return NextResponse.json(
      { ok: false, locked: true, retryAfterSec: lock.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(lock.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const password =
    typeof (body as { password?: unknown })?.password === "string"
      ? ((body as { password: string }).password)
      : "";

  const ok = await passwordMatches(password);
  if (!ok) {
    await recordFailure(ip);
    // A short delay makes automated guessing far slower without being
    // noticeable to someone who simply mistyped.
    await new Promise((r) => setTimeout(r, 400));
    // Uniform error; no hint whether ADMIN_PASSWORD is unset or wrong input.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await clearAttempts(ip);
  const token = await expectedAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WEEK,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
