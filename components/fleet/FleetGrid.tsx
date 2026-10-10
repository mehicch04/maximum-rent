"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUpDown,
  Briefcase,
  Bus,
  Car,
  CarFront,
  ChevronDown,
  Crown,
  Gauge,
  LayoutGrid,
  Mountain,
  Sun,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react";
import { CarCard } from "./CarCard";
import { InquiryModal } from "@/components/reservation/InquiryModal";
import {
  CAR_CATEGORIES,
  carCategories,
  type CarCategory,
} from "@/lib/car-categories";
import type { CarListItem, SearchContext } from "@/lib/types";
import type { ExtraItem } from "@/lib/extras";
import type { Booked } from "@/lib/extras-availability";

type Props = {
  cars: CarListItem[];
  search?: SearchContext;
  /** Pickup/return offices offered in the inquiry modal. */
  locations?: { id: string; name: string }[];
  /** Hide the type-filter bar (e.g. on the homepage featured section). */
  showFilters?: boolean;
  /** Eagerly load the first few car photos (use on the dedicated fleet page). */
  eagerFirstImages?: boolean;
  /** Override the image `sizes` (e.g. smaller on the homepage teaser grid). */
  imageSizes?: string;
  /** Optional equipment offered in the inquiry modal. */
  extras?: ExtraItem[];
  bookedExtras?: Booked[];
};

const CATEGORY_ICONS: Record<CarCategory, LucideIcon> = {
  LIMUZINA: Car,
  LUXURY: Crown,
  SUV: Mountain,
  COUPE: Gauge,
  COMPACT: CarFront,
  KARAVAN: Briefcase,
  CABRIO: Sun,
  TRANSPORT: Truck,
  MINIBUS: Bus,
};

const RAIL =
  "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden";

function Chip({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border pl-3.5 pr-3 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-brand-foreground shadow-brand"
          : "border-border bg-surface text-foreground hover:border-brand/50"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "" : "text-brand"}`} />
      {label}
      {count != null && (
        <span
          className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums ${
            active ? "bg-white/20" : "bg-surface-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

const BRAND_LOGOS: Record<string, string> = {
  audi: "audi",
  bmw: "bmw",
  mercedes: "mercedes-benz",
  "mercedes-benz": "mercedes-benz",
  skoda: "skoda",
  volkswagen: "volkswagen",
  vw: "volkswagen",
};

const BRAND_SHORT: Record<string, string> = {
  "mercedes-benz": "Mercedes",
  volkswagen: "Volkswagen",
};

function brandSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function brandLogo(name: string) {
  const file = BRAND_LOGOS[brandSlug(name)];
  return file ? `/brands/${file}.png` : null;
}

function BrandTile({
  active,
  onClick,
  name,
  count,
  all = false,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  count: number;
  all?: boolean;
}) {
  const logo = all ? null : brandLogo(name);
  const initials = name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-2 pb-2.5 pt-3.5 transition-[border-color,background-color,box-shadow] duration-200 sm:w-[100px] ${
        active
          ? "border-brand bg-brand/[0.06] ring-2 ring-brand/20"
          : "border-border bg-surface hover:border-brand/40"
      }`}
    >
      <span
        className={`flex h-10 w-14 items-center justify-center transition-colors duration-200 ${
          active ? "text-brand" : "text-foreground/80 group-hover:text-brand"
        }`}
      >
        {all ? (
          <LayoutGrid className="h-7 w-7" strokeWidth={1.75} />
        ) : logo ? (
          <span
            aria-hidden
            className="h-10 w-14 bg-current"
            style={{
              WebkitMaskImage: `url(${logo})`,
              maskImage: `url(${logo})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current font-display text-sm font-bold tracking-tight">
            {initials}
          </span>
        )}
      </span>
      <span
        className={`w-full truncate text-center text-[13px] font-semibold leading-tight ${
          active ? "text-brand-strong" : "text-foreground"
        }`}
        title={name}
      >
        {all ? name : (BRAND_SHORT[brandSlug(name)] ?? name)}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
          active
            ? "bg-brand text-brand-foreground"
            : "bg-surface-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export type SortKey =
  | "RECOMMENDED"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "YEAR_DESC"
  | "NAME_ASC"
  | "NAME_DESC";

/**
 * Client wrapper: owns the selected-car state (for the inquiry modal), the
 * active type filter and the sort order. Filtering/sorting is done client-side
 * because the fleet is small — instant, no extra requests. Cars can match
 * several categories at once.
 */
export function FleetGrid({
  cars,
  search,
  locations,
  showFilters = true,
  eagerFirstImages = false,
  imageSizes,
  extras,
  bookedExtras,
}: Props) {
  const t = useTranslations("Fleet");
  const [selected, setSelected] = useState<CarListItem | null>(null);
  const [active, setActive] = useState<CarCategory | "ALL">("ALL");
  const [brand, setBrand] = useState<string>("ALL");
  const [sort, setSort] = useState<SortKey>("RECOMMENDED");

  // Effective categories per car (explicit, else derived from carClass).
  const carCats = useMemo(
    () => new Map(cars.map((c) => [c.id, carCategories(c)])),
    [cars],
  );

  /**
   * Each filter's options are counted against what the *other* filters allow,
   * not against the whole fleet.
   *
   * Listing every brand regardless of the chosen category meant picking
   * "Transport" and then "BMW" landed on an empty page, with nothing to
   * suggest the combination was impossible before clicking it.
   *
   * A filter never narrows its own list: if categories were counted after the
   * category filter had been applied, choosing one would leave a dropdown with
   * a single entry and no way back.
   */
  const counts = useMemo(() => {
    const m = new Map<CarCategory, number>();
    for (const c of cars) {
      if (brand !== "ALL" && c.brand !== brand) continue;
      for (const cat of carCats.get(c.id) ?? []) {
        m.set(cat, (m.get(cat) ?? 0) + 1);
      }
    }
    return m;
  }, [cars, carCats, brand]);

  // Only categories that still have cars under the current brand.
  const typeOptions = useMemo(
    () =>
      CAR_CATEGORIES.filter((cat) => (counts.get(cat) ?? 0) > 0).map((cat) => ({
        id: cat,
        label: t(`categories.${cat}`),
        count: counts.get(cat) ?? 0,
      })),
    [counts, t],
  );

  // Brands that still have cars in the chosen category, alphabetical.
  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cars) {
      if (active !== "ALL" && !carCats.get(c.id)?.includes(active)) continue;
      const b = c.brand?.trim();
      if (b) m.set(b, (m.get(b) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "hr"));
  }, [cars, carCats, active]);

  const totalForBrands = useMemo(
    () => brands.reduce((a, [, n]) => a + n, 0),
    [brands],
  );

  /**
   * Clears a selection that the other filter has just made impossible.
   *
   * Picking BMW and then switching to Transport leaves a combination with no
   * cars in it. Rather than showing an empty page and letting the visitor work
   * out which of the two choices to undo, the one that no longer exists is
   * dropped and the other is honoured, since it is the one just chosen.
   */
  useEffect(() => {
    if (brand !== "ALL" && !brands.some(([b]) => b === brand)) {
      setBrand("ALL");
    }
  }, [brands, brand]);

  useEffect(() => {
    if (active !== "ALL" && (counts.get(active) ?? 0) === 0) {
      setActive("ALL");
    }
  }, [counts, active]);

  const filtersActive = active !== "ALL" || brand !== "ALL";
  const clearFilters = () => {
    setActive("ALL");
    setBrand("ALL");
  };

  const visibleCars = useMemo(() => {
    const filtered = cars.filter((c) => {
      const byType = active === "ALL" || carCats.get(c.id)?.includes(active);
      const byBrand = brand === "ALL" || c.brand === brand;
      return byType && byBrand;
    });

    switch (sort) {
      case "PRICE_ASC":
        // Cars without a price go last.
        return filtered.sort(
          (a, b) => (a.pricePerDay ?? Infinity) - (b.pricePerDay ?? Infinity),
        );
      case "PRICE_DESC":
        return filtered.sort(
          (a, b) => (b.pricePerDay ?? -Infinity) - (a.pricePerDay ?? -Infinity),
        );
      case "YEAR_DESC":
        return filtered.sort((a, b) => b.year - a.year);
      case "NAME_ASC":
        return filtered.sort((a, b) => a.title.localeCompare(b.title, "hr"));
      case "NAME_DESC":
        return filtered.sort((a, b) => b.title.localeCompare(a.title, "hr"));
      case "RECOMMENDED":
      default:
        return filtered; // owner's order from the admin (sortOrder)
    }
  }, [active, brand, sort, cars, carCats]);

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "RECOMMENDED", label: t("sort.recommended") },
    { value: "PRICE_ASC", label: t("sort.priceAsc") },
    { value: "PRICE_DESC", label: t("sort.priceDesc") },
    { value: "YEAR_DESC", label: t("sort.yearDesc") },
    { value: "NAME_ASC", label: t("sort.nameAsc") },
    { value: "NAME_DESC", label: t("sort.nameDesc") },
  ];

  return (
    <>
      {showFilters && (
        <div className="mb-8 space-y-5">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("typeLabel")}
            </p>
            <div className={RAIL}>
              <Chip
                active={active === "ALL"}
                onClick={() => setActive("ALL")}
                icon={LayoutGrid}
                label={t("allTypes")}
              />
              {typeOptions.map((o) => (
                <Chip
                  key={o.id}
                  active={active === o.id}
                  onClick={() => setActive(active === o.id ? "ALL" : o.id)}
                  icon={CATEGORY_ICONS[o.id]}
                  label={o.label}
                  count={o.count}
                />
              ))}
            </div>
          </div>

          {brands.length > 1 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("brandLabel")}
              </p>
              <div className={RAIL}>
                <BrandTile
                  active={brand === "ALL"}
                  onClick={() => setBrand("ALL")}
                  name={t("allBrands")}
                  count={totalForBrands}
                  all
                />
                {brands.map(([name, count]) => (
                  <BrandTile
                    key={name}
                    active={brand === name}
                    onClick={() => setBrand(brand === name ? "ALL" : name)}
                    name={name}
                    count={count}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <span className="text-sm font-semibold text-foreground">
              {t("resultsCount", { count: visibleCars.length })}
            </span>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-muted px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-brand-strong"
              >
                <X className="h-3.5 w-3.5" />
                {t("clearFilters")}
              </button>
            )}
            <div className="relative ml-auto w-full sm:w-56">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              <label htmlFor="fleet-sort" className="sr-only">
                {t("sort.label")}
              </label>
              <select
                id="fleet-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 w-full appearance-none truncate rounded-xl border border-border bg-surface pl-9 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-ring/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {visibleCars.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCars.map((car, i) => (
            <CarCard
              key={car.id}
              car={car}
              search={search}
              index={i}
              priority={eagerFirstImages && i < 3}
              imageSizes={imageSizes}
              onSelect={setSelected}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted-foreground">
          {t("noResults")}
        </p>
      )}

      <InquiryModal
        car={selected}
        search={search}
        locations={locations}
        extras={extras}
        bookedExtras={bookedExtras}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
