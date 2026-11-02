"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarClock, Tag } from "lucide-react";
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
          >
            <Go
              p={p}
              className={`group relative flex h-full overflow-hidden rounded-[26px] bg-ink text-white shadow-[0_30px_60px_-36px_rgba(17,17,19,0.7)] transition-transform duration-300 hover:-translate-y-1 ${
                single ? "flex-col md:min-h-[340px] md:flex-row" : "flex-col"
              }`}
            >
              <div className={`relative overflow-hidden ${single ? "aspect-[16/10] md:aspect-auto md:w-[55%]" : "aspect-[16/10]"}`}>
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes={single ? "(max-width: 767px) 92vw, 620px" : "(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 31vw"}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div aria-hidden className={`absolute inset-0 ${single ? "bg-gradient-to-t from-ink/70 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-ink" : "bg-gradient-to-t from-ink via-ink/20 to-transparent"}`} />
                {p.badge && (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(227,6,19,0.9)]">
                    <Tag className="h-3.5 w-3.5" />
                    {p.badge}
                  </span>
                )}
              </div>
              <div className={`relative flex flex-1 flex-col p-5 sm:p-6 ${single ? "md:justify-center md:p-10" : ""}`}>
                <span aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.35),transparent)]" />
                {p.endsAt && (
                  <span className="relative inline-flex items-center gap-1.5 self-start rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/10">
                    <CalendarClock className="h-3.5 w-3.5 text-brand-300" />
                    {t("until", { date: date(p.endsAt) })}
                  </span>
                )}
                <h3 className={`relative mt-3 text-balance font-display font-bold leading-tight tracking-tight ${single ? "text-2xl sm:text-3xl" : "text-xl"}`}>{p.title}</h3>
                {p.text && <p className="relative mt-2 text-sm leading-relaxed text-white/65 sm:text-[15px]">{p.text}</p>}
                <div className="relative mt-auto flex items-end justify-between gap-3 pt-6">
                  {p.price != null ? (
                    <span className="leading-tight">
                      {p.carTitle && <span className="block text-xs text-white/50">{p.carTitle}</span>}
                      <span className="font-display text-lg font-semibold">{t("from", { price: formatPrice(p.price, currency) })}</span>
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-white/80">{t("more")}</span>
                  )}
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </Go>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
