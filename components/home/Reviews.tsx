"use client";

import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import type { GoogleReview } from "@/lib/google-reviews";

const ease = [0.22, 1, 0.36, 1] as const;

export function Reviews({ reviews = [] }: { reviews?: GoogleReview[] }) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const company = useCompany();
  const RATING = company.rating.score ?? 0;
  const COUNT = company.rating.count ?? 0;
  const GOOGLE_URL = company.map.link ?? "#";
  const fillPct = (RATING / 5) * 100;
  const ratingLabel = RATING.toLocaleString(locale === "en" ? "en-GB" : "hr-HR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const shown = reviews.slice(0, 3);

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
              {ratingLabel}
            </span>
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
              {t("title", { rating: ratingLabel })}
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

        {shown.length > 0 && (
          <ul className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r, i) => (
              <li
                key={`${r.author}-${i}`}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-3">
                  {r.photo ? (
                    <img
                      src={r.photo}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
                    >
                      {r.author.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0">
                    {r.authorUrl ? (
                      <a
                        href={r.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-brand-strong"
                      >
                        {r.author}
                      </a>
                    ) : (
                      <p className="truncate text-sm font-semibold text-foreground">{r.author}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {r.when}
                      {r.when ? " · " : ""}Google
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex text-brand" role="img" aria-label={`${r.rating} / 5`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < r.rating ? "" : "text-border"}`}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-muted-foreground">
                  {r.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </section>
  );
}
