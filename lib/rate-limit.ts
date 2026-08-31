import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/login-throttle";

/**
 * Simple per-IP limit for the public forms.
 *
 * Without it, one script can fill the database with fake inquiries and bury
 * the owner's inbox and Telegram under thousands of messages — no password
 * needed, since these endpoints are public by design.
 *
 * Reuses the admin attempt table with a prefixed key, so no new table is
 * needed. Fails open: a database hiccup must never stop a real guest from
 * sending an inquiry.
 */

export async function tooManyRequests(
  req: Request,
  bucket: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const key = `${bucket}:${clientIp(req)}`;
  try {
    const now = new Date();
    const row = await prisma.adminLoginAttempt.findUnique({ where: { ip: key } });

    if (!row || now.getTime() - row.windowStart.getTime() > windowMs) {
      await prisma.adminLoginAttempt.upsert({
        where: { ip: key },
        create: { ip: key, failedCount: 1, windowStart: now },
        update: { failedCount: 1, windowStart: now },
      });
      return false;
    }

    if (row.failedCount >= max) return true;

    await prisma.adminLoginAttempt.update({
      where: { ip: key },
      data: { failedCount: row.failedCount + 1 },
    });
    return false;
  } catch {
    return false;
  }
}
