"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CarListItem } from "@/lib/types";
import { CarCard } from "./CarCard";

export function SimilarCars({ cars, title }: { cars: CarListItem[]; locale?: string; title: string }) {
  const t = useTranslations("Common");
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = () => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 8, end: el.scrollLeft >= max - 8 });
    const n = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    setPages(n);
    setPage(max <= 0 ? 0 : Math.round((el.scrollLeft / max) * (n - 1)));
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cars.length]);

  if (cars.length === 0) return null;

  const move = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  const btn = "grid h-10 w-10 place-items-center rounded-full ring-1 transition-colors disabled:cursor-default disabled:opacity-35";

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {pages > 1 && (
          <div className="flex gap-2">
            <button type="button" onClick={() => move(-1)} disabled={edge.start} aria-label={t("prev")} className={`${btn} bg-surface text-foreground ring-border hover:ring-brand/40 enabled:hover:text-brand-strong`}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(1)} disabled={edge.end} aria-label={t("next")} className={`${btn} bg-ink text-white ring-ink enabled:hover:bg-brand enabled:hover:ring-brand`}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <ul
        ref={track}
        onScroll={measure}
        className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {cars.map((c) => (
          <li key={c.id} className="w-[84%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
            <CarCard car={c} imageSizes="(max-width: 639px) 84vw, (max-width: 1023px) 46vw, 31vw" />
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: pages }, (_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? "w-6 bg-brand" : "w-1.5 bg-foreground/15"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
