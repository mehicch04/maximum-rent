"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Car as CarIcon } from "lucide-react";

import type { CarListItem } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";

/**
 * Other vehicles from the same class.
 *
 * With one or two there is nothing to scroll, so they sit in a plain row.
 * From three up it becomes a carousel that wraps around, which is what makes
 * it feel endless without duplicating any cards in the markup.
 */
export function SimilarCars({
  cars,
  locale,
  title,
}: {
  cars: CarListItem[];
  locale: string;
  title: string;
}) {
  const { currency } = useCurrency();
  const trackRef = useRef<HTMLUListElement>(null);
  const [atEnd, setAtEnd] = useState(false);
  const en = locale === "en";

  if (cars.length === 0) return null;

  const scrollable = cars.length >= 3;

  /**
   * Moves by one card, and wraps at either end.
   *
   * Wrapping by scrolling to the opposite side rather than cloning cards: a
   * cloned list means duplicate links on the page, which is bad for search and
   * confusing for screen readers.
   */
  const move = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.clientWidth / Math.min(3, cars.length);
    const maxLeft = el.scrollWidth - el.clientWidth;

    if (dir === 1 && el.scrollLeft >= maxLeft - 8) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir === -1 && el.scrollLeft <= 8) {
      el.scrollTo({ left: maxLeft, behavior: "smooth" });
    } else {
      el.scrollBy({ left: step * dir, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  };

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          {title}
        </h2>

        {scrollable && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={en ? "Previous" : "Prethodno"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand-strong"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={en ? "Next" : "Sljedeće"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand hover:text-brand-strong"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <ul
        ref={trackRef}
        onScroll={onScroll}
        className={
          scrollable
            ? // Snap points so a swipe always lands on a card, never between two.
              "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "grid gap-4 sm:grid-cols-2"
        }
      >
        {cars.map((c) => (
          <li
            key={c.id}
            className={
              scrollable
                ? "w-[78%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
                : ""
            }
          >
            <Link
              href={`/${locale}/vozila/${c.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-brand"
            >
              <div className="relative aspect-[16/10] w-full bg-surface-muted">
                {c.images?.[0] ? (
                  <Image
                    src={c.images[0]}
                    alt={c.title}
                    fill
                    sizes="(max-width: 639px) 78vw, (max-width: 1023px) 46vw, 31vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <CarIcon className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="truncate text-sm font-semibold text-foreground">
                  {c.title}
                </p>
                {c.pricePerDay != null && (
                  <p className="mt-1 text-sm text-brand-strong">
                    {formatPrice(c.pricePerDay, currency)}{" "}
                    <span className="text-xs text-muted-foreground">
                      / {en ? "day" : "dan"}
                    </span>
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
