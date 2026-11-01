"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, ChevronDown, Clock, Copy, Menu, Phone, Plane, Star, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_LINKS, SITE } from "@/lib/site-config";
import { useCompany } from "@/components/company/CompanyProvider";
import { CurrencySwitch } from "@/components/currency/CurrencySwitch";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { LanguageToggle } from "./LanguageToggle";
import { intlLocale } from "@/i18n/routing";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
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
            {company.hours}
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

export function Navbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const company = useCompany();
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const active = MAIN.findIndex((l) => isActive(l.href));
  const target = hover ?? (active >= 0 ? active : null);

  const measure = useCallback(() => {
    const el = target != null ? items.current[target] : null;
    setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  }, [target]);

  useIso(measure, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

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

  useEffect(() => setOpen(false), [pathname]);

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
      <header className="sticky top-0 z-50">
        <div
          className={`relative border-b transition-[background-color,box-shadow,border-color] duration-300 ${
            scrolled || open
              ? "border-border bg-surface/85 shadow-[0_14px_40px_-28px_rgba(17,17,19,0.45)] backdrop-blur-xl backdrop-saturate-150"
              : "border-border/70 bg-surface"
          }`}
        >
          <nav className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] lg:gap-4">
            <Link href="/" className="flex shrink-0 items-center lg:justify-self-start" aria-label={SITE.name}>
              <Image src="/logo.png" alt={SITE.name} width={800} height={239} priority className="h-9 w-auto sm:h-10" />
            </Link>

            <ul onMouseLeave={() => setHover(null)} className="relative hidden items-center rounded-full bg-surface-muted p-1 lg:flex">
              <span
                aria-hidden
                className={`absolute inset-y-1 rounded-full bg-ink shadow-[0_8px_18px_-10px_rgba(17,17,19,0.8)] transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${pill ? "opacity-100" : "opacity-0"}`}
                style={pill ? { left: pill.left, width: pill.width } : undefined}
              />
              {MAIN.map((link, i) => (
                <li key={link.href}>
                  <Link
                    ref={(el) => {
                      items.current[i] = el;
                    }}
                    href={link.href}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    aria-current={i === active ? "page" : undefined}
                    className={`relative z-10 block whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-200 xl:px-4 ${
                      target === i ? "text-white" : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 sm:gap-2 lg:justify-self-end">
              <div className="flex items-center rounded-full bg-surface-muted p-0.5">
                <LanguageToggle />
                <span aria-hidden className="h-4 w-px bg-border" />
                <CurrencySwitch />
              </div>
              <Link
                href="/vozila"
                className="group relative hidden h-11 items-center gap-2 overflow-hidden rounded-full bg-brand pl-5 pr-1.5 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(227,6,19,0.85)] transition-[transform,background-color] duration-300 hover:bg-brand-700 active:scale-[0.98] sm:inline-flex lg:hidden xl:inline-flex"
              >
                <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-[transform,opacity] duration-700 group-hover:translate-x-[420%] group-hover:opacity-100" />
                {t("book")}
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <button
                type="button"
                aria-label={t("menu")}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-foreground transition-colors hover:bg-border/70 lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
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
