import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/login-throttle";

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
