import type { Car } from "@prisma/client";

/**
 * Prisma `Decimal` cannot be passed from a Server Component into a Client
 * Component. We convert price fields to plain numbers before crossing the
 * boundary; everything else (enums, Date) serializes fine.
 */
export type CarListItem = Omit<
  Car,
  "pricePerDay" | "seasonalPrice" | "deposit"
> & {
  /**
   * The rate actually being charged right now. When seasonal pricing is on and
   * the car has a seasonal rate, this is that rate. Resolving it here means
   * every card, calculation and email downstream simply reads one number and
   * cannot accidentally show the wrong one.
   */
  pricePerDay: number | null;
  /** True when the number above came from the seasonal rate. */
  isSeasonalPrice: boolean;
  deposit: number | null;
};

export function toCarListItem(car: Car, seasonalActive = false): CarListItem {
  const regular = car.pricePerDay != null ? Number(car.pricePerDay) : null;
  const seasonal =
    car.seasonalPrice != null ? Number(car.seasonalPrice) : null;

  // A car without a seasonal rate keeps its regular one, so turning the season
  // on can never leave a vehicle without a price.
  const useSeasonal =
    seasonalActive && seasonal != null && Number.isFinite(seasonal);

  const { seasonalPrice: _seasonal, ...rest } = car;

  return {
    ...rest,
    pricePerDay: useSeasonal ? seasonal : regular,
    isSeasonalPrice: useSeasonal,
    deposit: car.deposit != null ? Number(car.deposit) : null,
  };
}

/** Shared shape for passing the active search down to cards / modal. */
export type SearchContext = {
  pickupLocationId?: string;
  returnLocationId?: string;
  pickupLocation?: { name: string } | null;
  returnLocation?: { name: string } | null;
  pickupAt?: string | null;
  returnAt?: string | null;
};
