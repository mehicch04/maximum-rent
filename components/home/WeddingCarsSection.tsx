"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, Heart, Minus, Phone, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import { ImageLightbox } from "@/components/fleet/ImageLightbox";
import { PillLink } from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { WED_BLUR } from "./wedding-blur";
import { Petals } from "./Petals";

const ORDER = [7, 10, 5, 8, 6, 9, 1, 2, 3, 4];
const SRC = ORDER.map((id) => `/wed-${id}.webp`);
const COUNT = ORDER.length;
const MAX = 8;
const MS = 5200;
const EASE = [0.22, 1, 0.36, 1] as const;

function Rings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <circle cx="12.5" cy="14" r="7.5" />
      <circle cx="21.5" cy="14" r="7.5" />
      <path d="M21.5 1.2 24 4l-2.5 2.6L19 4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CarGlyph({ lead }: { lead: boolean }) {
  return (
    <svg viewBox="0 0 48 21" className="block h-auto w-full overflow-visible drop-shadow-[0_6px_6px_rgba(17,17,19,0.18)]" aria-hidden>
      {lead && (
        <g fill="#fff" stroke="#E30613" strokeWidth="0.6">
          <path d="M24 3.2 19.8 0.6V5.8Z" />
          <path d="M24 3.2 28.2 0.6V5.8Z" />
          <circle cx="24" cy="3.2" r="1.2" />
        </g>
      )}
      <path
        d="M3 16V12.6C3 11.3 4 10.4 5.6 10.2L12.6 9.4 16.8 5.4C17.5 4.8 18.4 4.4 19.4 4.4H28.4C29.6 4.4 30.7 4.9 31.5 5.8L35 9.6 42.4 10.6C44.6 10.9 46 12.2 46 14.2V16C46 16.6 45.6 17 45 17H42.5A4.5 4.5 0 0 0 33.5 17H15.5A4.5 4.5 0 0 0 6.5 17H4C3.4 17 3 16.6 3 16Z"
        fill={lead ? "#E30613" : "#222226"}
      />
      <path d="M18.4 6.1C18.7 5.8 19.1 5.7 19.6 5.7H24V9.2H15Z" fill="#fff" fillOpacity="0.55" />
      <path d="M25.2 5.7H28.3C29 5.7 29.6 6 30.1 6.5L32.6 9.2H25.2Z" fill="#fff" fillOpacity="0.55" />
      {lead && <path d="M35.5 10.4 46 12" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" />}
      <circle cx="11" cy="17" r="3.6" fill="#111113" />
      <circle cx="11" cy="17" r="1.4" fill="#c9c9cf" />
      <circle cx="38" cy="17" r="3.6" fill="#111113" />
      <circle cx="38" cy="17" r="1.4" fill="#c9c9cf" />
    </svg>
  );
}

function Plate({ text, kick }: { text: string; kick: number }) {
  return (
    <div className="pointer-events-none absolute left-4 top-0 z-10 sm:left-6">
      <div key={kick} className="origin-top motion-safe:animate-[plate-swing_2.6s_cubic-bezier(0.3,0,0.3,1)_both]">
        <svg viewBox="0 0 120 22" className="mx-auto block h-[22px] w-[112px]" aria-hidden>
          <path d="M6 22 60 3 114 22" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.4" fill="none" />
          <circle cx="60" cy="3" r="2.6" fill="#fff" />
        </svg>
        <div className="-mt-px rounded-[7px] bg-white p-[3px] shadow-[0_16px_30px_-14px_rgba(0,0,0,0.75)] ring-1 ring-black/10">
          <div className="flex items-center gap-1.5 rounded-[5px] border-[1.5px] border-ink px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
            <Heart className="h-2.5 w-2.5 fill-brand text-brand sm:h-3 sm:w-3" />
            <span className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink sm:text-[13px]">{text}</span>
            <Heart className="h-2.5 w-2.5 fill-brand text-brand sm:h-3 sm:w-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeddingCarsSection() {
  const t = useTranslations("WeddingCars");
  const tc = useTranslations("Common");
  const company = useCompany();
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const inView = useInView(box, { margin: "-120px" });
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [kick, setKick] = useState(0);
  const [cars, setCars] = useState(3);
  const run = inView && !hold && lightbox === null && !reduce;

  useEffect(() => {
    if (inView) setKick((k) => k + 1);
  }, [inView]);

  useEffect(() => {
    const el = strip.current;
    const th = el?.children[active] as HTMLElement | undefined;
    if (!el || !th) return;
    el.scrollTo({ left: Math.max(0, th.offsetLeft - (el.clientWidth - th.clientWidth) / 2), behavior: "smooth" });
  }, [active]);

  const go = (n: number) => {
    setActive((n + COUNT) % COUNT);
    setKick((k) => k + 1);
  };

  const roles = t.raw("convoyRoles") as string[];
  const summary = cars <= roles.length ? roles[cars - 1] : t("convoyMany", { extra: cars - roles.length });
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t("waText", { count: cars }))}`;
  const phone = company.phones[0];

  return (
    <section id="vjencanja" className="scroll-mt-24 px-3 py-3 sm:px-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#FFF8F6] ring-1 ring-brand-100">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,157,161,0.35),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-32 -z-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.10),transparent)]" />
        <Petals className="-z-10" />

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-16 lg:gap-y-0">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-lg:order-1 lg:col-start-1 lg:row-start-1 lg:self-end"
          >
            <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
              <Rings className="h-4 w-6" />
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.6rem]">
              {t("title")} <span className="text-brand-strong">{t("accent")}</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="max-lg:order-3 lg:col-start-1 lg:row-start-2 lg:self-start"
          >
            <p className="border-l-2 border-brand pl-4 lg:mt-6 text-lg leading-relaxed text-foreground">{t("p1")}</p>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>

            <div className="mt-8 rounded-[22px] bg-white/85 p-4 shadow-[0_24px_50px_-36px_rgba(227,6,19,0.55)] ring-1 ring-brand-100 backdrop-blur-sm sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold text-foreground">{t("convoyTitle")}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t("convoyLead")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-surface-muted p-1">
                  <button
                    type="button"
                    onClick={() => setCars((n) => Math.max(1, n - 1))}
                    disabled={cars <= 1}
                    aria-label={t("less")}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white text-foreground shadow-sm ring-1 ring-border transition-transform active:scale-90 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span aria-live="polite" className="w-7 text-center font-display text-lg font-bold tabular-nums text-foreground">
                    {cars}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCars((n) => Math.min(MAX, n + 1))}
                    disabled={cars >= MAX}
                    aria-label={t("more")}
                    className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white shadow-sm transition-transform active:scale-90 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative mt-4 h-14">
                <span aria-hidden className="absolute inset-x-0 bottom-0.5 border-t-2 border-dashed border-brand/20" />
                <ul className="relative flex h-full items-end gap-1.5 sm:gap-2">
                  <AnimatePresence initial={false}>
                    {Array.from({ length: cars }, (_, i) => (
                      <motion.li
                        key={i}
                        layout
                        initial={{ opacity: 0, x: -28 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 28, transition: { duration: 0.18 } }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="min-w-0 max-w-[58px] flex-1"
                      >
                        <CarGlyph lead={i === 0} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <p className="mt-3 text-sm text-foreground/80">{summary}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <PillLink href={wa} icon={<WhatsAppIcon className="h-4 w-4" />}>
                {t("ctaCount", { count: cars })}
              </PillLink>
              {phone && (
                <PillLink href={phone.href} variant="outline" icon={<Phone className="h-4 w-4" />}>
                  {t("call")}
                </PillLink>
              )}
            </div>
          </motion.div>

          <motion.div
            ref={box}
            initial={{ opacity: 0, y: 24, rotate: 1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-lg:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(active + 1);
              if (e.key === "ArrowLeft") go(active - 1);
            }}
          >
            <div
              onTouchStart={(e) => {
                setHold(true);
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                setHold(false);
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
              }}
              className="relative aspect-[4/3] overflow-hidden rounded-[26px] bg-ink shadow-[0_40px_80px_-44px_rgba(17,17,19,0.75)] sm:aspect-[3/2]"
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 0.6 }, scale: { duration: 1.4, ease: EASE } }}
                  className="absolute inset-0"
                >
                  <Image
                    src={SRC[active]}
                    alt={t("imageAlt", { n: active + 1 })}
                    fill
                    sizes="(max-width: 1023px) 94vw, 640px"
                    quality={90}
                    placeholder="blur"
                    blurDataURL={WED_BLUR[ORDER[active]]}
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />

              <Plate text={t("plate")} kick={kick} />

              <button
                type="button"
                onClick={() => setLightbox(active)}
                aria-label={t("open")}
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 sm:right-4 sm:top-4"
              >
                <Expand className="h-4 w-4" />
              </button>

              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between sm:inset-x-4 sm:bottom-4">
                <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-md">
                  {String(active + 1).padStart(2, "0")} <span className="text-white/60">/ {COUNT}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => go(active - 1)}
                    aria-label={tc("prevImage")}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-transform hover:bg-white active:scale-90"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(active + 1)}
                    aria-label={tc("nextImage")}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-transform hover:bg-white active:scale-90"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div ref={strip} className="no-scrollbar -mx-1 mt-2 flex snap-x gap-2 overflow-x-auto p-1">
              {SRC.map((src, i) => {
                const on = i === active;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={t("imageAlt", { n: i + 1 })}
                    aria-current={on || undefined}
                    className={`relative aspect-[3/2] w-[22%] shrink-0 snap-start overflow-hidden rounded-xl transition-[opacity,box-shadow] duration-300 sm:w-[18%] ${
                      on ? "opacity-100 ring-2 ring-brand ring-offset-2 ring-offset-[#FFF8F6]" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                    {on && (
                      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-black/30">
                        <span
                          key={active}
                          onAnimationEnd={() => setActive((active + 1) % COUNT)}
                          className="block h-full origin-left bg-brand"
                          style={{ animation: `ticker-fill ${MS}ms linear forwards`, animationPlayState: run ? "running" : "paused" }}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <ImageLightbox
        images={SRC}
        title={`${t("title")} ${t("accent")}`}
        openIndex={lightbox}
        onClose={() => setLightbox(null)}
        thumbSizes="(max-width: 1023px) 94vw, 640px"
      />
    </section>
  );
}
