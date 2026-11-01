"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { useMapsConsent } from "@/lib/consent";
import { MapPlaceholder } from "@/components/consent/MapConsent";

export type MapSpot = { slug: string; name: string; street: string; query: string; link: string };

export function LocationMap({ spots, locale, openLabel, routeLabel }: { spots: MapSpot[]; locale: string; openLabel: string; routeLabel: string }) {
  const [active, setActive] = useState(0);
  const [ok, allow] = useMapsConsent();
  const spot = spots[active] ?? spots[0];
  if (!spot) return null;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(spot.query)}&z=15&hl=${locale}&output=embed`;
  const route = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(spot.query)}`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-5">
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {spots.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.slug} className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                className={`group flex h-full w-full items-start gap-3.5 rounded-[22px] p-4 text-left ring-1 transition-[background-color,box-shadow,transform] duration-300 sm:p-5 ${
                  on
                    ? "bg-ink text-white shadow-[0_24px_50px_-28px_rgba(17,17,19,0.8)] ring-ink dark:bg-white dark:text-ink dark:ring-white"
                    : "bg-surface text-foreground ring-border hover:-translate-y-0.5 hover:ring-brand/30"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-colors duration-300 ${
                    on ? "bg-brand text-white" : "bg-brand/10 text-brand-strong group-hover:bg-brand group-hover:text-white"
                  }`}
                >
                  <MapPin className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-semibold leading-snug">{s.name}</span>
                  <span className={`mt-1 block text-sm leading-snug ${on ? "text-white/65 dark:text-ink/60" : "text-muted-foreground"}`}>{s.street}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="relative h-[380px] overflow-hidden rounded-[28px] bg-surface-muted ring-1 ring-border sm:h-[460px]">
        {ok === false && <MapPlaceholder link={spot.link} onAllow={() => allow(true)} />}
        <AnimatePresence initial={false}>
          {ok && (
          <motion.iframe
            key={spot.slug}
            src={src}
            title={`${spot.name}, ${spot.street}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 h-full w-full grayscale-[20%] dark:hue-rotate-180 dark:invert-[0.9]"
          />
          )}
        </AnimatePresence>
        <div className={`pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4 ${ok ? "" : "hidden"}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={spot.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto max-w-full rounded-2xl bg-white/95 px-4 py-3 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)] backdrop-blur"
            >
              <p className="font-display text-sm font-semibold">{spot.name}</p>
              <p className="mt-0.5 text-xs text-ink/60">{spot.street}</p>
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-auto flex gap-2">
            <a
              href={route}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(227,6,19,0.7)] transition-colors hover:bg-brand-700"
            >
              <Navigation className="h-4 w-4" />
              {routeLabel}
            </a>
            <a
              href={spot.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={openLabel}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-[0_12px_26px_-14px_rgba(0,0,0,0.5)] transition-colors hover:bg-white/90"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
