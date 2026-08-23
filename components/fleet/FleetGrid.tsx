"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";
import { CarCard } from "./CarCard";
import { InquiryModal } from "@/components/reservation/InquiryModal";
import {
  CAR_CATEGORIES,
  carCategories,
  type CarCategory,
} from "@/lib/car-categories";
import type { CarListItem, SearchContext } from "@/lib/types";
import type { ExtraItem } from "@/lib/extras";

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
};

/** Compact labelled dropdown used by the fleet toolbar. */
function Select({
  id,
  label,
  value,
  onChange,
  children,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none truncate rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-ring/30"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
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
export function FleetGrid({ cars, search, locations, showFilters = true, eagerFirstImages = false, imageSizes, extras }: Props) {
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

  // Counts per category — used for the chip badges and to hide empty ones.
  const counts = useMemo(() => {
    const m = new Map<CarCategory, number>();
    for (const cats of carCats.values()) {
      for (const cat of cats) m.set(cat, (m.get(cat) ?? 0) + 1);
    }
    return m;
  }, [carCats]);

  // Only categories that actually have cars, so the list never shows dead ends.
  const typeOptions = useMemo(
    () =>
      CAR_CATEGORIES.filter((cat) => (counts.get(cat) ?? 0) > 0).map((cat) => ({
        id: cat,
        label: t(`categories.${cat}`),
        count: counts.get(cat) ?? 0,
      })),
    [counts, t],
  );

  // Brands present in the fleet, alphabetical, with how many cars each has.
  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cars) {
      const b = c.brand?.trim();
      if (b) m.set(b, (m.get(b) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "hr"));
  }, [cars]);

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
        <div className="mb-8">
          {/* Filters and sort are the same control, so they look the same.
              A native <select> also opens the phone's own picker, which shows
              every option at once — no horizontal swiping to discover them. */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 gap-2 sm:flex-none">
              <Select
                id="fleet-type"
                label={t("typeLabel")}
                value={active}
                onChange={(v) => setActive(v as CarCategory | "ALL")}
                className="flex-1 sm:w-44"
              >
                <option value="ALL">{t("allTypes")}</option>
                {typeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} ({o.count})
                  </option>
                ))}
              </Select>

              {brands.length > 1 && (
                <Select
                  id="fleet-brand"
                  label={t("brandLabel")}
                  value={brand}
                  onChange={setBrand}
                  className="flex-1 sm:w-44"
                >
                  <option value="ALL">{t("allBrands")}</option>
                  {brands.map(([name, count]) => (
                    <option key={name} value={name}>
                      {name} ({count})
                    </option>
                  ))}
                </Select>
              )}
            </div>

            <Select
              id="fleet-sort"
              label={t("sort.label")}
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              className="w-full sm:ml-auto sm:w-52"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {t("resultsCount", { count: visibleCars.length })}
            </span>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 transition-colors hover:text-brand-strong hover:underline"
              >
                <X className="h-3.5 w-3.5" />
                {t("clearFilters")}
              </button>
            )}
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
        onClose={() => setSelected(null)}
      />
    </>
  );
}
