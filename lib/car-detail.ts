import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCompany } from "@/lib/company";
import { toCarListItem, type CarListItem } from "@/lib/types";

/**
 * One vehicle, by its slug.
 *
 * Withdrawn cars are still served: a link may be in somebody's messages or in
 * Google's index, and a page saying the car is no longer offered is a better
 * answer than a dead end. The page itself decides how to present that.
 */
export const getCarBySlug = unstable_cache(
  async (slug: string): Promise<CarListItem | null> => {
    const car = await prisma.car.findUnique({ where: { slug } });
    if (!car) return null;
    const { seasonalPricing } = await getCompany().catch(() => ({
      seasonalPricing: false,
    }));
    return toCarListItem(car, seasonalPricing);
  },
  ["car-by-slug"],
  { tags: ["fleet"], revalidate: 300 },
);

/**
 * A few alternatives from the same class, for when this one does not fit.
 *
 * Same class rather than same price: somebody looking at a seven-seater needs
 * another seven-seater, and a cheaper saloon is no help at all.
 */
export const getSimilarCars = unstable_cache(
  async (slug: string, carClass: string): Promise<CarListItem[]> => {
    const rows = await prisma.car.findMany({
      where: { isAvailable: true, carClass: carClass as never, slug: { not: slug } },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      take: 3,
    });
    const { seasonalPricing } = await getCompany().catch(() => ({
      seasonalPricing: false,
    }));
    return rows.map((c) => toCarListItem(c, seasonalPricing));
  },
  ["similar-cars"],
  { tags: ["fleet"], revalidate: 300 },
);

/** Every slug, for the sitemap. */
export const getAllCarSlugs = unstable_cache(
  async (): Promise<{ slug: string; updatedAt: Date }[]> =>
    prisma.car.findMany({
      where: { isAvailable: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["car-slugs"],
  { tags: ["fleet"], revalidate: 3600 },
);
