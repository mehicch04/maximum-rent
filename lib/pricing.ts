import { getCompany } from "@/lib/company";
import { effectivePrice } from "@/lib/company";

/**
 * The daily rate a car is actually being offered at right now.
 *
 * The public listings already resolve the seasonal rate before showing it, but
 * every place that *saved* a price read the raw column instead. During a season
 * that meant the guest was quoted one figure and charged another, and the
 * reports carried the lower one. One function, called everywhere, so the two
 * can no longer drift apart.
 */
export async function dailyRate(car: {
  pricePerDay?: unknown;
  seasonalPrice?: unknown;
} | null): Promise<number> {
  if (!car) return 0;
  const { seasonalPricing } = await getCompany().catch(() => ({
    seasonalPricing: false,
  }));
  return effectivePrice(car, seasonalPricing) ?? 0;
}

/** Rental total for a whole booking, at the rate in force today. */
export async function rentalTotal(
  car: { pricePerDay?: unknown; seasonalPrice?: unknown } | null,
  days: number,
): Promise<number> {
  return (await dailyRate(car)) * Math.max(1, days);
}
