import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5; // failures allowed inside one window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BASE_LOCK_MS = 15 * 60 * 1000; // first lockout, doubles on repeat

/** Caller's IP, as forwarded by Vercel's proxy. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export type LockState = { locked: boolean; retryAfterSec: number };

export async function checkLock(ip: string): Promise<LockState> {
  try {
    const row = await prisma.adminLoginAttempt.findUnique({ where: { ip } });
    if (!row?.lockedUntil) return { locked: false, retryAfterSec: 0 };

    const left = row.lockedUntil.getTime() - Date.now();
    if (left <= 0) return { locked: false, retryAfterSec: 0 };

    return { locked: true, retryAfterSec: Math.ceil(left / 1000) };
  } catch {
    return { locked: false, retryAfterSec: 0 };
  }
}

/** Records a failed attempt and locks the IP once the limit is reached. */
export async function recordFailure(ip: string): Promise<void> {
  try {
    const now = new Date();
    const row = await prisma.adminLoginAttempt.findUnique({ where: { ip } });

    // Fresh window: either nothing recorded yet, or the old window expired.
    if (!row || now.getTime() - row.windowStart.getTime() > WINDOW_MS) {
      await prisma.adminLoginAttempt.upsert({
        where: { ip },
        create: { ip, failedCount: 1, windowStart: now, lockedUntil: null },
        update: { failedCount: 1, windowStart: now, lockedUntil: null },
      });
      return;
    }

    const failed = row.failedCount + 1;
    if (failed < MAX_ATTEMPTS) {
      await prisma.adminLoginAttempt.update({
        where: { ip },
        data: { failedCount: failed },
      });
      return;
    }

    // Each additional block doubles, so repeated attacks get slower fast.
    const previousBlocks = Math.floor(failed / MAX_ATTEMPTS) - 1;
    const lockMs = BASE_LOCK_MS * Math.pow(2, Math.min(previousBlocks, 4));
    await prisma.adminLoginAttempt.update({
      where: { ip },
      data: { failedCount: failed, lockedUntil: new Date(Date.now() + lockMs) },
    });
  } catch {
    // Never block a login attempt because bookkeeping failed.
  }
}

/** Clears the counter after a successful login. */
export async function clearAttempts(ip: string): Promise<void> {
  try {
    await prisma.adminLoginAttempt.deleteMany({ where: { ip } });
  } catch {
    /* nothing to do */
  }
}
