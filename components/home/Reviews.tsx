"use client";

import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { SITE } from "@/lib/site-config";

const ease = [0.22, 1, 0.36, 1] as const;

// Rating and the Maps link live in site-config so they are stated once and
// stay in step with the hero — they used to be duplicated here.
const RATING = SITE.rating.score;
const COUNT = SITE.rating.count;
const GOOGLE_URL = SITE.map.link;

export function Reviews() {
  const t = useTranslations("Reviews");
  const fillPct = (RATING / 5) * 100;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand/[0.08] via-surface to-surface px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <p className="mb-3 flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
          <span className="h-px w-7 bg-brand" />
          {t("eyebrow")}
          <span className="h-px w-7 bg-brand" />
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
          <div className="flex flex-col items-center">
            <span className="font-display text-6xl font-bold leading-none text-foreground sm:text-7xl">
              {RATING.toLocaleString("hr-HR")}
            </span>
            {/* star bar with accurate partial fill */}
            <div className="relative mt-3 inline-block">
              <div className="flex text-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-6 w-6" fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <div
                className="absolute inset-0 flex overflow-hidden text-brand"
                style={{ width: `${fillPct}%` }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 shrink-0" fill="currentColor" strokeWidth={0} />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden h-20 w-px bg-border sm:block" />

          <div className="max-w-sm sm:text-left">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("subtitle", { count: COUNT })}
            </p>
            <a
              href={GOOGLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              {t("cta")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
