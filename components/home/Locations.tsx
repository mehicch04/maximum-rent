"use client";

import { motion } from "framer-motion";
import { MapPin, Plane } from "lucide-react";
import { useTranslations } from "next-intl";
import { LOCATIONS } from "@/lib/site-config";
import { SectionHeading } from "./SectionHeading";

const ease = [0.22, 1, 0.36, 1] as const;

export function Locations() {
  const t = useTranslations("Locations");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LOCATIONS.map((loc, i) => {
          const isAirport = loc.name.includes("Zračna luka");
          const Icon = isAirport ? Plane : MapPin;
          return (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.25, ease } }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.3), ease }}
              className={`group relative overflow-hidden rounded-2xl border p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover ${
                isAirport
                  ? "border-brand/40 bg-gradient-to-br from-brand/[0.07] to-surface"
                  : "border-border bg-surface"
              }`}
            >
              {isAirport && (
                <span className="absolute right-4 top-4 rounded-full bg-brand px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-brand-foreground">
                  {t("airportBadge")}
                </span>
              )}
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                  isAirport
                    ? "bg-brand text-brand-foreground"
                    : "bg-brand/10 text-brand group-hover:bg-brand group-hover:text-brand-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                {loc.name}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{loc.street}</p>
              <p className="text-sm text-muted-foreground">{loc.city}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
