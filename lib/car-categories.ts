export const CAR_CATEGORIES = [
  "LIMUZINA",
  "LUXURY",
  "SUV",
  "COUPE",
  "COMPACT",
  "KARAVAN",
  "CABRIO",
  "TRANSPORT",
  "MINIBUS",
] as const;

export type CarCategory = (typeof CAR_CATEGORIES)[number];

const CLASS_TO_CATEGORY: Record<string, CarCategory> = {
  CITY_CAR: "COMPACT",
  ECONOMY: "COMPACT",
  COMPACT: "COMPACT",
  MIDSIZE: "LIMUZINA",
  FULLSIZE: "LIMUZINA",
  LUXURY: "LUXURY",
  SUV: "SUV",
  VAN: "TRANSPORT",
  MINIBUS: "MINIBUS",
};

export function carCategories(car: {
  categories?: string[] | null;
  carClass: string;
}): CarCategory[] {
  if (car.categories && car.categories.length > 0) {
    return car.categories.filter((c): c is CarCategory =>
      (CAR_CATEGORIES as readonly string[]).includes(c),
    );
  }
  const derived = CLASS_TO_CATEGORY[car.carClass];
  return derived ? [derived] : [];
}
