"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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

/**
 * Client wrapper: owns the selected-car state (for the inquiry modal) and the
 * active type filter. Filtering is done client-side because the fleet is small
 * — instant, no extra requests. Cars can match several categories at once.
 */
export function FleetGrid({ cars, search, locations, showFilters = true, eagerFirstImages = false }: Props) {
  const t = useTranslations("Fleet");
  const [selected, setSelected] = useState<CarListItem | null>(null);
  const [active, setActive] = useState<CarCategory | "ALL">("ALL");

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
    if (active === "ALL") return cars;
    return cars.filter((c) => carCats.get(c.id)?.includes(active));
  }, [active, cars, carCats]);

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
