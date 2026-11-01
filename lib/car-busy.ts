import { prisma } from "@/lib/prisma";
import type { BusyRange } from "@/lib/booking";

export async function getCarBusy(carId: string): Promise<BusyRange[]> {
  const now = new Date();
  try {
    const [inquiries, blocks] = await Promise.all([
      prisma.inquiry.findMany({
        where: { carId, status: { in: ["CONFIRMED", "IN_PROGRESS"] }, returnAt: { gt: now } },
        select: { pickupAt: true, returnAt: true },
      }),
      prisma.carBlock.findMany({
        where: { carId, endAt: { gt: now } },
        select: { startAt: true, endAt: true },
      }),
    ]);
    return [
      ...inquiries.map((i: { pickupAt: Date; returnAt: Date }) => ({ from: i.pickupAt.toISOString(), to: i.returnAt.toISOString() })),
      ...blocks.map((b: { startAt: Date; endAt: Date }) => ({ from: b.startAt.toISOString(), to: b.endAt.toISOString() })),
    ];
  } catch {
    return [];
  }
}
