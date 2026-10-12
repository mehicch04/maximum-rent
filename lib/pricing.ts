import { getCompany } from "@/lib/company";
import { effectivePrice } from "@/lib/company";

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
