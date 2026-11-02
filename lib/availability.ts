import { prisma } from "@/lib/prisma";
import { toCarListItem, type CarListItem } from "@/lib/types";
import { getCompany, getTurnaroundMinutes } from "@/lib/company";

export function isValidPeriod(pickupAt: Date, returnAt: Date): boolean {
  return (
    !Number.isNaN(pickupAt.getTime()) &&
    !Number.isNaN(returnAt.getTime()) &&
    returnAt.getTime() > pickupAt.getTime()
  );
}

export async function getAvailableCars(
  pickupAt: Date,
  returnAt: Date,
): Promise<CarListItem[]> {
  const pad = (await getTurnaroundMinutes()) * 60_000;
  const cars = await prisma.car.findMany({
    where: {
      isAvailable: true,
      inquiries: {
        none: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          pickupAt: { lt: new Date(returnAt.getTime() + pad) },
          returnAt: { gt: new Date(pickupAt.getTime() - pad) },
        },
      },
      blocks: {
        none: {
          startAt: { lt: returnAt },
          endAt: { gt: pickupAt },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
  const { seasonalPricing } = await getCompany();
  return cars.map((c) => toCarListItem(c, seasonalPricing));
}

export type FreeWindow = { pickupAt: string; returnAt: string; free: number };

export async function getNearestFreeWindows(pickupAt: Date, returnAt: Date, max = 3): Promise<FreeWindow[]> {
  const DAY = 86_400_000;
  const span = returnAt.getTime() - pickupAt.getTime();
  const now = Date.now();
  const from = new Date(Math.max(now, pickupAt.getTime() - 14 * DAY));
  const to = new Date(returnAt.getTime() + 30 * DAY);
  const pad = (await getTurnaroundMinutes()) * 60_000;
  const cars = await prisma.car.findMany({
    where: { isAvailable: true },
    select: {
      id: true,
      inquiries: {
        where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] }, pickupAt: { lt: to }, returnAt: { gt: from } },
        select: { pickupAt: true, returnAt: true },
      },
      blocks: {
        where: { startAt: { lt: to }, endAt: { gt: from } },
        select: { startAt: true, endAt: true },
      },
    },
  });
  const busy = cars.map((c) => [
    ...(c.inquiries ?? []).map((q) => [new Date(q.pickupAt).getTime() - pad, new Date(q.returnAt).getTime() + pad] as const),
    ...(c.blocks ?? []).map((b) => [new Date(b.startAt).getTime(), new Date(b.endAt).getTime()] as const),
  ]);
  const out: FreeWindow[] = [];
  for (let step = 1; step <= 30 && out.length < max; step++) {
    for (const off of [step, -step]) {
      if (out.length >= max) break;
      const s = pickupAt.getTime() + off * DAY;
      const e = s + span;
      if (s < now) continue;
      const free = busy.filter((ranges) => ranges.every(([a, b]) => !(a < e && b > s))).length;
      if (free > 0) out.push({ pickupAt: new Date(s).toISOString(), returnAt: new Date(e).toISOString(), free });
    }
  }
  return out.sort((a, b) => a.pickupAt.localeCompare(b.pickupAt));
}
