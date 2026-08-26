import type {
  Car,
  CarCategory,
  CarClass,
  FuelType,
  Transmission,
} from "@prisma/client";

type Option<T> = { value: T; label: string };

export const CAR_CLASS_OPTIONS: Option<CarClass>[] = [
  { value: "CITY_CAR", label: "Gradski auto" },
  { value: "ECONOMY", label: "Ekonomična" },
  { value: "COMPACT", label: "Kompaktna" },
  { value: "MIDSIZE", label: "Srednja klasa" },
  { value: "FULLSIZE", label: "Viša klasa" },
  { value: "LUXURY", label: "Luksuzna" },
  { value: "SUV", label: "SUV" },
  { value: "VAN", label: "Kombi (Van)" },
  { value: "MINIBUS", label: "Minibus" },
];

export const CAR_CATEGORY_OPTIONS: Option<CarCategory>[] = [
  { value: "LIMUZINA", label: "Limuzina" },
  { value: "LUXURY", label: "Luksuzni" },
  { value: "SUV", label: "SUV" },
  { value: "COUPE", label: "Coupé" },
  { value: "COMPACT", label: "Kompakt" },
  { value: "KARAVAN", label: "Karavan" },
  { value: "CABRIO", label: "Kabriolet" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "MINIBUS", label: "Minibus" },
];

export const TRANSMISSION_OPTIONS: Option<Transmission>[] = [
  { value: "MANUAL", label: "Manuelni" },
  { value: "AUTOMATIC", label: "Automatik" },
];

export const FUEL_OPTIONS: Option<FuelType>[] = [
  { value: "PETROL", label: "Benzin" },
  { value: "DIESEL", label: "Dizel" },
  { value: "HYBRID", label: "Hibrid" },
  { value: "PLUG_IN_HYBRID", label: "Plug-in hibrid" },
  { value: "ELECTRIC", label: "Električni" },
];

const labelOf = <T extends string>(opts: Option<T>[], v: T) =>
  opts.find((o) => o.value === v)?.label ?? v;

export const carClassLabel = (v: CarClass) => labelOf(CAR_CLASS_OPTIONS, v);

/** URL-safe slug from text (handles HR diacritics). */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    č: "c", ć: "c", đ: "d", š: "s", ž: "z",
    Č: "c", Ć: "c", Đ: "d", Š: "s", Ž: "z",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Plain, client-safe vehicle shape (Prisma `Decimal`/`Date` converted to
 * primitives so it can cross the server→client boundary).
 */
export type AdminVehicle = Omit<
  Car,
  "pricePerDay" | "deposit" | "createdAt" | "updatedAt"
> & {
  pricePerDay: number | null;
  deposit: number | null;
  createdAt: string;
  updatedAt: string;
};
