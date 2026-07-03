import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toCarListItem, type CarListItem } from "@/lib/types";

/**
 * Cached "browse" data for the fleet + home pages.
 *
 * These lists change rarely (only when the owner edits the fleet in the admin),
 * so we serve them from Next's Data Cache instead of hitting the database on
 * every visit. That removes a DB round-trip from the critical path (faster TTFB).
 *
 * Freshness: revalidated every 5 minutes AND invalidated on demand via the
 * "fleet" tag whenever a vehicle is created / updated / deleted in the admin
 * (see app/admin/vozila/actions.ts -> revalidateTag("fleet")).
 *
 * NOTE: the date-based availability query (getAvailableCars) is intentionally
 * NOT cached — it must reflect live reservations to avoid showing a booked car.
 */

/** All offerable cars, no date filter (the default /vozila browse view). */
export const getBrowseCars = unstable_cache(
  async (): Promise<CarListItem[]> => {
    const rows = await prisma.car.findMany({
      where: { isAvailable: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(toCarListItem);
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
      select: { id: true, name: true, city: true },
    }),
  ["active-locations"],
  { revalidate: 300, tags: ["fleet", "locations"] },
);
