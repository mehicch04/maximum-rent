"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Church, Clock, Copy, Map as MapIcon, Menu, Phone, Plane, Signpost, Star, Ticket, X, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_LINKS, SITE } from "@/lib/site-config";
import { useCompany } from "@/components/company/CompanyProvider";
import { CurrencySwitch } from "@/components/currency/CurrencySwitch";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { LanguageToggle } from "./LanguageToggle";
import { intlLocale } from "@/i18n/routing";
import { formatHours } from "@/lib/hours";
import { Price } from "@/components/currency/Price";
import type { CarCategory } from "@/lib/car-categories";
import type { GuideIcon } from "@/lib/guides";
import type { NavData } from "@/lib/nav-data";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAIN = NAV_LINKS.filter((l) => l.href !== "/");

function Rating() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const company = useCompany();
  const score = company.rating.score ?? SITE.rating.score;
  const count = company.rating.count ?? SITE.rating.count;
  return (
    <>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="h-3 w-3 fill-[#F5A524] text-[#F5A524]" />
        ))}
      </span>
      <span className="font-semibold text-white">
        {score.toLocaleString(intlLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </span>
      <span>{t("rating", { count })}</span>
    </>
  );
}

function PhoneMenu() {
  const t = useTranslations("Nav");
  const company = useCompany();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const main = company.phones[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(v);
      window.setTimeout(() => setCopied((c) => (c === v ? null : c)), 1500);
    } catch {}
  };

  if (!main) return null;

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex h-7 items-center gap-2 rounded-full bg-white/[0.06] pl-1 pr-2.5 font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] aria-expanded:bg-white/[0.12]"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
          <Phone className="h-3 w-3" />
        </span>
        {main.value}
        {company.phones.length > 1 && (
          <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-semibold text-white/70">+{company.phones.length - 1}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute right-0 top-full w-72 origin-top-right pt-2"
          >
            <div className="overflow-hidden rounded-2xl bg-ink p-1.5 text-white shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
              {company.phones.map((p) => (
                <div key={p.value} className="group flex items-center gap-1 rounded-xl transition-colors hover:bg-white/[0.06]">
                  <a href={p.href} className="flex min-w-0 flex-1 items-center gap-3 px-2.5 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.07] text-brand-400 transition-colors group-hover:bg-brand group-hover:text-white">
                      <Phone className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">{p.label}</span>
                      <span className="block truncate text-sm font-semibold">{p.value}</span>
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => copy(p.value)}
                    aria-label={`${t("copy")}: ${p.value}`}
                    className="mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {copied === p.value ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
              <a
                href={`https://wa.me/${company.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-[#06301A] transition-[filter] hover:brightness-105"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopBar() {
  const t = useTranslations("Nav");
  const company = useCompany();
  const locale = useLocale();
  return (
    <div className="relative z-[60] bg-ink text-white/70">
      <div className="mx-auto flex h-9 max-w-[1320px] items-center justify-between gap-6 px-6 text-xs">
        <a href={company.map.link ?? SITE.map.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-white">
          <Rating />
        </a>
        <span className="inline-flex items-center gap-2">
          <Plane className="h-3.5 w-3.5 text-brand-400" />
          {t("airport")}
        </span>
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-400" />
            {formatHours(company.hours, locale)}
          </span>
          <PhoneMenu />
        </div>
      </div>
    </div>
  );
}

function MobileTopBar() {
  const company = useCompany();
  return (
    <a
      href={company.map.link ?? SITE.map.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 items-center justify-center gap-2 bg-ink px-4 text-xs text-white/70"
    >
      <Rating />
    </a>
  );
}

type MenuKey = "fleet" | "guides";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

const GUIDE_ICONS: Record<GuideIcon, LucideIcon> = {
  fines: Ticket,
  rules: Signpost,
  trips: MapIcon,
  airport: Plane,
  medjugorje: Church,
};

const WARM: CarCategory[] = ["SUV", "LUXURY", "COUPE", "CABRIO"];
const fallback = (c: CarCategory) => (WARM.includes(c) ? "/fleet-premium.webp" : "/fleet-aerial.webp");

const FEATURED = [
  { href: { pathname: "/", hash: "vjencanja" }, image: "/wed-5.webp", title: "wedding", note: "weddingNote" },
  { href: "/vozila?tip=LUXURY", image: "/fleet-premium.webp", title: "premium", note: "premiumNote" },
  { href: "/poslovna-ponuda", image: "/fleet-aerial.webp", title: "longTerm", note: "longTermNote" },
] as const;

function FleetPanel({ data, onEnter, onLeave, onPick }: { data: NavData; onEnter: () => void; onLeave: () => void; onPick: () => void }) {
  const t = useTranslations("Nav");
  const tf = useTranslations("Fleet");
  const [cat, setCat] = useState<CarCategory | undefined>(data.categories[0]?.key);
  const current = data.categories.find((c) => c.key === cat) ?? data.categories[0];
  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: EASE }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full hidden border-b border-border bg-surface shadow-[0_40px_60px_-30px_rgba(17,17,19,0.45)] lg:block"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-[230px_minmax(0,1fr)_240px] gap-6 px-6 pb-8 pt-7 xl:grid-cols-[260px_minmax(0,1fr)_250px] xl:gap-7">
        <div>
          <p className={`${LABEL} mb-2.5 ml-3.5`}>{t("categories")}</p>
          <ul>
            {data.categories.map((c) => {
              const on = c.key === current.key;
              return (
                <li key={c.key}>
                  <Link
                    href={`/vozila?tip=${c.key}`}
                    onMouseEnter={() => setCat(c.key)}
                    onFocus={() => setCat(c.key)}
                    onClick={onPick}
                    className={`relative flex h-11 items-center justify-between rounded-[10px] px-3.5 text-[14.5px] transition-colors duration-200 ${
                      on ? "bg-surface-muted font-semibold text-foreground" : "font-medium text-foreground/75 hover:text-foreground"
                    }`}
                  >
                    <span aria-hidden className={`absolute inset-y-3 left-0 w-[3px] origin-center rounded-full bg-brand transition-transform duration-200 ${on ? "scale-y-100" : "scale-y-0"}`} />
                    {tf(`categories.${c.key}`)}
                    <span className={`text-xs tabular-nums ${on ? "text-brand-strong" : "text-muted-foreground"}`}>{c.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <Link href={`/vozila?tip=${current.key}`} onClick={onPick} className="group relative min-h-[300px] overflow-hidden rounded-2xl bg-ink">
          {data.categories.map((c) => (
            <Image
              key={c.key}
              src={c.image ?? fallback(c.key)}
              alt=""
              fill
              sizes="(min-width: 1280px) 760px, 560px"
              className={`object-cover transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                c.key === current.key ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            />
          ))}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <span className="absolute left-5 top-4 rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-md">
            {t("carsCount", { count: current.count })}
          </span>
          <span className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-6 text-white">
            <span className="min-w-0">
              <span className="block text-[28px] font-bold leading-tight tracking-[-0.02em]">{tf(`categories.${current.key}`)}</span>
              <span className="mt-1 block text-[13.5px] text-white/75">{t(`catNote.${current.key}`)}</span>
            </span>
            {current.from != null && (
              <span className="shrink-0 text-right text-xs text-white/70">
                {t("from")}
                <Price bam={current.from} className="block text-2xl font-bold leading-tight text-white" />
                {t("perDay")}
              </span>
            )}
          </span>
        </Link>

        <div className="flex flex-col gap-2">
          <p className={`${LABEL} mb-1 ml-0.5`}>{t("featured")}</p>
          {FEATURED.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              onClick={onPick}
              className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors duration-200 hover:border-foreground/15 hover:bg-surface-muted"
            >
              <span className="relative h-10 w-[52px] shrink-0 overflow-hidden rounded-lg">
                <Image src={f.image} alt="" fill sizes="52px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-semibold text-foreground">{t(f.title)}</span>
                <span className="block truncate text-xs text-muted-foreground">{t(f.note)}</span>
              </span>
            </Link>
          ))}
          <Link
            href="/vozila"
            onClick={onPick}
            className="group mt-auto flex h-[52px] items-center justify-between rounded-xl bg-ink px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-700"
          >
            {t("allCars", { count: data.total })}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function GuidesPanel({ guides, onPick }: { guides: NavData["guides"]; onPick: () => void }) {
  const t = useTranslations("Nav");
  const items = [
    ...guides.map((g) => ({ href: `/vodici/${g.slug}`, Icon: GUIDE_ICONS[g.icon] ?? BookOpen, title: g.title, sub: g.sub ?? t("minutes", { n: g.minutes }) })),
    { href: "/uvjeti-najma", Icon: BookOpen, title: t("terms"), sub: t("termsNote") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 8, x: "-50%" }}
      transition={{ duration: 0.2, ease: EASE }}
      className="absolute left-1/2 top-full z-10 w-[620px] pt-3"
    >
      <span aria-hidden className="absolute left-1/2 top-[7px] h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-surface shadow-[-1px_-1px_0_rgba(17,17,19,0.06)]" />
      <div className="overflow-hidden rounded-[18px] bg-surface shadow-[0_30px_70px_-20px_rgba(17,17,19,0.45)] ring-1 ring-black/[0.06]">
        <ul className="grid grid-cols-2 gap-1 p-3">
          {items.map(({ href, Icon, title, sub }) => (
            <li key={href}>
              <Link href={href} onClick={onPick} className="group flex gap-3.5 rounded-xl p-3.5 transition-colors duration-200 hover:bg-surface-muted">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-brand/10 text-brand-strong transition-colors duration-200 group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-foreground">{title}</span>
                  <span className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">{sub}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border/70 bg-surface-muted/70 px-6 py-3.5 text-[13px]">
          <span className="text-muted-foreground">{t("guidesNote")}</span>
          <Link href="/vodici" onClick={onPick} className="group inline-flex items-center gap-1.5 font-semibold text-brand-strong">
            {t("allGuides")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function Navbar({ data }: { data: NavData }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const company = useCompany();
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const timer = useRef<number>();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const menuFor = (href: string): MenuKey | null =>
    href === "/vozila" && data.categories.length ? "fleet" : href === "/vodici" && data.guides.length ? "guides" : null;
  const keep = () => window.clearTimeout(timer.current);
  const show = (m: MenuKey) => {
    keep();
    setMenu(m);
  };
  const hide = () => {
    keep();
    timer.current = window.setTimeout(() => setMenu(null), 140);
  };
  const pick = () => {
    keep();
    setMenu(null);
  };

  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, y / max)) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menu]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <>
      <div className="hidden lg:block">
        <TopBar />
      </div>
      <div className="lg:hidden">
        <MobileTopBar />
      </div>
      <AnimatePresence>
        {open && (
          <motion.button
            key="scrim"
            type="button"
            aria-label={t("menu")}
            tabIndex={-1}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menu === "fleet" && (
          <motion.div
            key="mega-scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-0 z-40 hidden bg-ink/25 backdrop-blur-[2px] lg:block"
          />
        )}
      </AnimatePresence>
      <header className="sticky top-0 z-50">
        <div
          className={`relative border-b transition-[background-color,box-shadow,border-color] duration-300 ${
            scrolled || open
              ? "border-border bg-surface/85 shadow-[0_14px_40px_-28px_rgba(17,17,19,0.45)] backdrop-blur-xl backdrop-saturate-150"
              : "border-border/70 bg-surface"
          }`}
        >
          <nav className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:grid lg:h-[76px] lg:grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] lg:gap-6">
            <Link href="/" className="flex shrink-0 items-center lg:justify-self-start" aria-label={SITE.name}>
              <Image src="/logo.png" alt={SITE.name} width={800} height={239} priority className="h-9 w-auto sm:h-10" />
            </Link>

            <ul className="hidden h-full items-stretch gap-6 lg:flex xl:gap-8">
              {MAIN.map((link) => {
                const on = isActive(link.href);
                const m = menuFor(link.href);
                const lit = on || (m != null && menu === m);
                return (
                  <li
                    key={link.href}
                    className="relative flex"
                    onMouseEnter={m ? () => show(m) : undefined}
                    onMouseLeave={m ? hide : undefined}
                  >
                    <Link
                      href={link.href}
                      onClick={pick}
                      onFocus={m ? () => show(m) : undefined}
                      aria-current={on ? "page" : undefined}
                      aria-haspopup={m ? "true" : undefined}
                      aria-expanded={m ? menu === m : undefined}
                      className={`group relative flex items-center gap-1 whitespace-nowrap text-[14.5px] transition-colors duration-200 ${
                        on ? "font-semibold text-foreground" : lit ? "font-medium text-foreground" : "font-medium text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      {t(link.key)}
                      {m && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-[transform,color] duration-200 ${menu === m ? "rotate-180 text-brand" : "text-foreground/35"}`}
                        />
                      )}
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 -bottom-px h-[3px] origin-center rounded-t-[3px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          lit ? "scale-x-100 bg-brand" : "scale-x-0 bg-foreground/20 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                    {m === "guides" && (
                      <AnimatePresence>{menu === "guides" && <GuidesPanel guides={data.guides} onPick={pick} />}</AnimatePresence>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2 sm:gap-3 lg:justify-self-end">
              <div className="flex items-center rounded-[10px] border border-border p-0.5">
                <LanguageToggle />
                <span aria-hidden className="h-4 w-px bg-border" />
                <CurrencySwitch />
              </div>
              <Link
                href="/vozila"
                className="hidden h-11 items-center rounded-[10px] bg-brand px-5 text-sm font-semibold text-white shadow-[0_10px_22px_-14px_rgba(227,6,19,0.9)] transition-[transform,background-color] duration-200 hover:bg-brand-700 active:scale-[0.98] sm:inline-flex lg:hidden xl:inline-flex"
              >
                {t("book")}
              </Link>
              <button
                type="button"
                aria-label={t("menu")}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-surface-muted text-foreground transition-colors hover:bg-border/70 lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
          <AnimatePresence>
            {menu === "fleet" && <FleetPanel data={data} onEnter={keep} onLeave={hide} onPick={pick} />}
          </AnimatePresence>
          <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
            <span ref={bar} className="block h-full origin-left bg-brand-gradient will-change-transform" style={{ transform: "scaleX(0)" }} />
          </span>

          <AnimatePresence>
            {open && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="absolute inset-x-3 top-full mx-auto mt-2 max-h-[calc(100dvh-8.5rem)] max-w-6xl origin-top overflow-y-auto rounded-[28px] bg-surface p-3 shadow-[0_30px_60px_-30px_rgba(17,17,19,0.55)] ring-1 ring-border sm:inset-x-4 lg:hidden"
              >
                <ul className="grid gap-1">
                  {NAV_LINKS.map((link, i) => (
                    <motion.li key={link.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i, duration: 0.25, ease: EASE }}>
                      <Link
                        href={link.href}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-colors ${
                          isActive(link.href) ? "bg-ink text-white" : "text-foreground hover:bg-surface-muted"
                        }`}
                      >
                        {t(link.key)}
                        <ArrowUpRight className={`h-4 w-4 ${isActive(link.href) ? "text-brand-400" : "text-muted-foreground"}`} />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <Link
                  href="/vozila"
                  className="mt-3 flex h-14 items-center justify-between rounded-full bg-brand pl-6 pr-2 text-base font-semibold text-white shadow-[0_14px_30px_-16px_rgba(227,6,19,0.85)] active:scale-[0.99] sm:hidden"
                >
                  {t("book")}
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
                <div className="mt-3 grid gap-2">
                  <div className="grid gap-1 rounded-[22px] bg-surface-muted p-1.5">
                    {company.phones.map((p) => (
                      <a
                        key={p.value}
                        href={p.href}
                        className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <Phone className="h-4 w-4 text-brand-strong" />
                          {p.value}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">{t("call")}</span>
                      </a>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/${company.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-[#06301A]"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
