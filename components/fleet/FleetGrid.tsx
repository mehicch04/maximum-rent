"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { CarCard } from "./CarCard";
import { FleetFilters, type FilterItem } from "./FleetFilters";
import { InquiryModal } from "@/components/reservation/InquiryModal";
import {
  CAR_CATEGORIES,
  carCategories,
  type CarCategory,
} from "@/lib/car-categories";
import type { CarListItem, SearchContext } from "@/lib/types";

type Props = {
  cars: CarListItem[];
  search?: SearchContext;
  /** Pickup/return offices offered in the inquiry modal. */
  locations?: { id: string; name: string }[];
  /** Hide the type-filter bar (e.g. on the homepage featured section). */
  showFilters?: boolean;
  /** Eagerly load the first few car photos (use on the dedicated fleet page). */
  eagerFirstImages?: boolean;
};

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
export function FleetGrid({ cars, search, locations, showFilters = true, eagerFirstImages = false }: Props) {
  const t = useTranslations("Fleet");
  const [selected, setSelected] = useState<CarListItem | null>(null);
  const [active, setActive] = useState<CarCategory | "ALL">("ALL");
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

  const filterItems = useMemo<FilterItem[]>(() => {
    const items: FilterItem[] = [
      { id: "ALL", label: t("all"), count: cars.length },
    ];
    for (const cat of CAR_CATEGORIES) {
      const count = counts.get(cat) ?? 0;
      if (count > 0) {
        items.push({ id: cat, label: t(`categories.${cat}`), count });
      }
    }
    return items;
  }, [counts, cars.length, t]);

  const visibleCars = useMemo(() => {
    const filtered =
      active === "ALL"
        ? [...cars]
        : cars.filter((c) => carCats.get(c.id)?.includes(active));

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
  }, [active, sort, cars, carCats]);

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
      {showFilters && filterItems.length > 1 && (
        <FleetFilters
          items={filterItems}
          active={active}
          onChange={setActive}
          label={t("filterLabel")}
          swipeHint={t("swipeHint")}
        />
      )}

      {showFilters && (
        <div className="mb-6 flex items-center justify-end gap-2">
          <label
            htmlFor="fleet-sort"
            className="text-sm text-muted-foreground"
          >
            {t("sort.label")}
          </label>
          <div className="relative">
            <select
              id="fleet-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 appearance-none rounded-xl border border-border bg-surface pl-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30"
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
        onClose={() => setSelected(null)}
      />
    </>
  );
}
