import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toCarListItem, type CarListItem } from "@/lib/types";
import { getCompany } from "@/lib/company";

/** All offerable cars, no date filter (the default /vozila browse view). */
export const getBrowseCars = unstable_cache(
  async (): Promise<CarListItem[]> => {
    const rows = await prisma.car.findMany({
      where: { isAvailable: true },
      orderBy: { sortOrder: "asc" },
    });
    const { seasonalPricing } = await getCompany();
    return rows.map((c) => toCarListItem(c, seasonalPricing));
  },
  ["fleet-browse-cars"],
  { revalidate: 300, tags: ["fleet"] },
);

/** Active pickup / return offices. */
export const getActiveLocations = unstable_cache(
  async () =>
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        street: true,
        city: true,
        postalCode: true,
      },
    }),
  ["active-locations"],
  { revalidate: 300, tags: ["fleet", "locations"] },
);
