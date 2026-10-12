import type { Car } from "@prisma/client";

export type CarListItem = Omit<
  Car,
  "pricePerDay" | "seasonalPrice" | "deposit"
> & {
  pricePerDay: number | null;
  /** True when the number above came from the seasonal rate. */
  isSeasonalPrice: boolean;
  deposit: number | null;
};

export function toCarListItem(car: Car, seasonalActive = false): CarListItem {
  const regular = car.pricePerDay != null ? Number(car.pricePerDay) : null;
  const seasonal =
    car.seasonalPrice != null ? Number(car.seasonalPrice) : null;

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
