"use client";

import { motion } from "framer-motion";
import { CalendarRange, Truck, Plane, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ease = [0.22, 1, 0.36, 1] as const;
const ICONS = [CalendarRange, Truck, Plane];

export function BusinessTeaser() {
  const t = useTranslations("BusinessTeaser");
  const points = t.raw("points") as string[];

  return (
    <section className="border-y border-border bg-surface-muted/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-16">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="mb-3 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
            <span className="h-px w-7 bg-brand" />
            {t("eyebrow")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            {t("body")}
          </p>
          <Link
            href="/poslovna-ponuda"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Visual: stacked feature rows */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="grid gap-3"
        >
          {points.map((point, i) => {
            const Icon = ICONS[i] ?? CalendarRange;
            return (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-medium text-foreground">{point}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
