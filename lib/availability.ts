import { prisma } from "@/lib/prisma";
import { toCarListItem, type CarListItem } from "@/lib/types";
import { getCompany } from "@/lib/company";

export function isValidPeriod(pickupAt: Date, returnAt: Date): boolean {
  return (
    !Number.isNaN(pickupAt.getTime()) &&
    !Number.isNaN(returnAt.getTime()) &&
    returnAt.getTime() > pickupAt.getTime()
  );
}

/** All offerable cars that are free for the whole requested period. */
export async function getAvailableCars(
  pickupAt: Date,
  returnAt: Date,
): Promise<CarListItem[]> {
  const cars = await prisma.car.findMany({
    where: {
      isAvailable: true,
      inquiries: {
        none: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          pickupAt: { lt: returnAt },
          returnAt: { gt: pickupAt },
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

