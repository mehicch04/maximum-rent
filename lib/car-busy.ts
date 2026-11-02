import { prisma } from "@/lib/prisma";
import { getTurnaroundMinutes } from "@/lib/company";
import type { BusyRange } from "@/lib/booking";

function localMidnight(day: Date): string {
  const iso = day.toISOString().slice(0, 10);
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Sarajevo", timeZoneName: "shortOffset" })
    .formatToParts(new Date(`${iso}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  const hours = Number(zone?.match(/GMT([+-]\d+)/)?.[1] ?? 1);
  return new Date(Date.parse(`${iso}T00:00:00Z`) - hours * 3_600_000).toISOString();
}

export async function getCarBusy(carId: string): Promise<BusyRange[]> {
  const now = Date.now();
  try {
    const pad = (await getTurnaroundMinutes()) * 60_000;
    const [inquiries, blocks] = await Promise.all([
      prisma.inquiry.findMany({
        where: { carId, status: { in: ["CONFIRMED", "IN_PROGRESS"] }, returnAt: { gt: new Date(now - pad) } },
        select: { pickupAt: true, returnAt: true },
      }),
      prisma.carBlock.findMany({
        where: { carId, endAt: { gt: new Date(now) } },
        select: { startAt: true, endAt: true },
      }),
    ]);
    return [
      ...inquiries.map((i: { pickupAt: Date; returnAt: Date }) => ({
        from: new Date(i.pickupAt.getTime() - pad).toISOString(),
        to: new Date(i.returnAt.getTime() + pad).toISOString(),
      })),
      ...blocks.map((b: { startAt: Date; endAt: Date }) => ({ from: localMidnight(b.startAt), to: localMidnight(b.endAt) })),
    ];
  } catch {
    return [];
  }
}
