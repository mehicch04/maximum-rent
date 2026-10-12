import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCompany } from "@/lib/company";
import { toCarListItem, type CarListItem } from "@/lib/types";

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
