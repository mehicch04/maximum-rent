"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarX,
  Globe,
  Headset,
  IdCard,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import { Heading } from "./Heading";

const ICONS = [BadgeCheck, IdCard, ShieldCheck, Wallet, Globe, CalendarX];
const EASE = [0.22, 1, 0.36, 1] as const;

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

function Support({ className = "" }: { className?: string }) {
  const t = useTranslations("Faq");
  const company = useCompany();
  const phone = company.phones[0];
  return (
    <div className={`relative overflow-hidden rounded-[24px] bg-ink p-5 text-white ring-1 ring-white/5 sm:p-6 ${className}`}>
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.35),transparent)]" />
      <div className="relative flex items-center gap-4">
        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
          <Headset className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-400 ring-2 ring-ink">
            <span className="absolute inset-0 rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold leading-tight">{t("supportTitle")}</p>
          <p className="mt-1 text-sm leading-snug text-white/60">{t("support")}</p>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-2 gap-2">
        <a
          href={`https://wa.me/${company.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-ink transition-[transform,filter] hover:brightness-105 active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        {phone && (
          <a
            href={phone.href}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15 active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" />
            {t("call")}
          </a>
        )}
      </div>
    </div>
  );
}

export function Faq() {
  const t = useTranslations("Faq");
  const items = t.raw("items") as { q: string; a: string }[];
  const facts = t.raw("facts") as { v: string; l: string }[];
  const [open, setOpen] = useState<number | null>(0);
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const term = fold(q.trim());
    return items.map((it, i) => ({ ...it, i })).filter((it) => !term || fold(`${it.q} ${it.a}`).includes(term));
  }, [items, q]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} subtitle={t("lead")} />
          <ul className="mt-8 grid grid-cols-2 gap-2.5">
            {facts.map((f, i) => (
              <motion.li
                key={f.l}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className="rounded-2xl bg-surface p-4 ring-1 ring-border"
              >
                <p className="font-display text-[1.6rem] font-bold leading-none text-brand-strong">
                  {f.v}
                </p>
                <p className="mt-2 text-xs leading-snug text-muted-foreground">{f.l}</p>
              </motion.li>
            ))}
          </ul>
          <Support className="mt-4 hidden lg:block" />
        </div>

        <div>
          <label className="relative block">
            <span className="sr-only">{t("search")}</span>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="h-12 w-full rounded-full bg-surface pl-11 pr-11 text-base text-foreground outline-none ring-1 ring-border transition-shadow placeholder:text-muted-foreground/80 focus:ring-2 focus:ring-brand/40 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label={t("clear")}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <ul className="mt-4 space-y-2.5">
            {shown.map((item, k) => {
              const isOpen = open === item.i;
              const Icon = ICONS[item.i] ?? BadgeCheck;
              return (
                <motion.li
                  key={item.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, delay: Math.min(k, 6) * 0.04, ease: EASE }}
                  className={`overflow-hidden rounded-2xl ring-1 transition-[background-color,box-shadow] duration-300 ${
                    isOpen
                      ? "bg-surface shadow-[0_24px_50px_-34px_rgba(227,6,19,0.45)] ring-brand/30"
                      : "bg-surface/60 ring-border hover:bg-surface hover:ring-foreground/15"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : item.i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${
                        isOpen ? "bg-brand text-white" : "bg-brand/10 text-brand-strong"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1 font-display text-[15px] font-semibold leading-snug text-foreground sm:text-base">{item.q}</span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-300 ${
                        isOpen ? "rotate-45 bg-ink text-white dark:bg-white dark:text-ink" : "bg-surface-muted text-foreground/60"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pl-4 pr-6 text-sm leading-relaxed text-muted-foreground sm:pl-[4.75rem] sm:pr-14 sm:text-[15px]">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>

          {shown.length === 0 && <p className="mt-4 rounded-2xl bg-surface p-5 text-sm text-muted-foreground ring-1 ring-border">{t("empty")}</p>}

          <Support className="mt-6 lg:hidden" />
        </div>
      </div>
    </section>
  );
}
