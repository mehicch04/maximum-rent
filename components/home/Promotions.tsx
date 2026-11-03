"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { intlLocale } from "@/i18n/routing";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import type { PromoItem } from "@/lib/promotions";
import { Heading } from "./Heading";

const EASE = [0.22, 1, 0.36, 1] as const;

function Go({ p, className, children }: { p: PromoItem; className: string; children: React.ReactNode }) {
  if (p.external)
    return (
      <a href={p.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  return (
    <Link href={p.href} className={className}>
      {children}
    </Link>
  );
}

export function Promotions({ items }: { items: PromoItem[] }) {
  const t = useTranslations("Promotions");
  const locale = useLocale();
  const { currency } = useCurrency();
  if (!items.length) return null;

  const date = (iso: string) => new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long" }).format(new Date(iso));
  const single = items.length === 1;

  return (
    <section id="akcije" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24">
      <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} />
      <ul className={`mt-10 grid gap-4 ${single ? "" : "md:grid-cols-2"} ${items.length > 2 ? "lg:grid-cols-3" : ""}`}>
        {items.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
            className="h-full"
          >
            <Go
              p={p}
              className={`group relative flex h-full overflow-hidden rounded-[22px] bg-ink text-white sm:rounded-[24px] ${
                single ? "min-h-[500px] md:min-h-[440px]" : "min-h-[460px]"
              }`}
            >
              <Image
                src={single ? "/fleet-premium.webp" : p.image}
                alt={p.title}
                fill
                sizes={single ? "(max-width: 1151px) 100vw, 1104px" : "(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 31vw"}
                className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${single ? "object-[22%_50%] md:object-center" : ""}`}
              />
              <div
                aria-hidden
                className={`absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 via-50% to-transparent to-80% ${
                  single ? "md:from-ink/85 md:via-ink/45 md:via-40% md:to-70%" : ""
                }`}
              />
              <div
                className={`relative mt-auto flex w-full flex-col gap-5 p-5 sm:p-6 ${
                  single ? "md:flex-row md:items-end md:justify-between md:gap-10 md:p-10" : ""
                }`}
              >
                <div className={single ? "md:max-w-[600px]" : ""}>
                  {(p.badge || p.endsAt) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {p.badge && <span className="rounded-lg bg-brand px-3 py-1.5 text-[13px] font-bold leading-none text-white">{p.badge}</span>}
                      {p.endsAt && <span className="text-[13px] font-medium text-white/85">{t("until", { date: date(p.endsAt) })}</span>}
                    </div>
                  )}
                  <h3
                    className={`mt-3 text-balance font-display font-bold leading-tight tracking-tight ${
                      single ? "text-[23px] sm:text-[28px] md:mt-4 md:text-4xl" : "text-[22px] sm:text-2xl"
                    }`}
                  >
                    {p.title}
                  </h3>
                  {p.text && (
                    <p className={`mt-2 text-sm leading-relaxed text-white/85 ${single ? "md:mt-3 md:text-[15px]" : "line-clamp-3"}`}>{p.text}</p>
                  )}
                </div>
                <div className={`flex items-center justify-between gap-3 ${single ? "md:shrink-0 md:flex-col md:items-end md:gap-4" : ""}`}>
                  {p.price != null && (
                    <span className={`min-w-0 leading-tight ${single ? "md:text-right" : ""}`}>
                      {p.carTitle && <span className="block truncate text-xs text-white/80 sm:text-[13px]">{p.carTitle}</span>}
                      <span className={`block whitespace-nowrap font-display text-base font-semibold ${single ? "md:text-xl" : ""}`}>
                        {t("from", { price: formatPrice(p.price, currency) })}
                      </span>
                    </span>
                  )}
                  {single ? (
                    <span className="ml-auto inline-flex shrink-0 items-center gap-2.5 rounded-full bg-white py-1 pl-4 pr-1 text-[13px] font-semibold text-ink transition-colors duration-300 group-hover:bg-white/90 sm:gap-3 sm:pl-5 sm:text-sm">
                      {t("more")}
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:rotate-45 sm:h-[34px] sm:w-[34px]">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </span>
                  ) : (
                    <span className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5" />
                      <span className="sr-only">{t("more")}</span>
                    </span>
                  )}
                </div>
              </div>
            </Go>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
