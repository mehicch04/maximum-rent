"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Car, Check, ChevronLeft, ChevronRight, Expand, HandHeart, Heart, Phone, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import { ImageLightbox } from "@/components/fleet/ImageLightbox";
import { PillLink } from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { WED_BLUR } from "./wedding-blur";

const ORDER = [7, 10, 5, 8, 6, 9, 1, 2, 3, 4];
const SRC = ORDER.map((id) => `/wed-${id}.webp`);
const COUNT = ORDER.length;
const MS = 5600;
const EASE = [0.22, 1, 0.36, 1] as const;
const ROLE_ICONS = [Heart, HandHeart, Users, Car];

function Rings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <circle cx="12.5" cy="14" r="7.5" />
      <circle cx="21.5" cy="14" r="7.5" />
      <path d="M21.5 1.2 24 4l-2.5 2.6L19 4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WeddingCarsSection() {
  const t = useTranslations("WeddingCars");
  const tc = useTranslations("Common");
  const company = useCompany();
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const inView = useInView(stage, { margin: "-120px" });
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const roles = t.raw("roles") as string[];
  const [picked, setPicked] = useState<number[]>([0]);
  const run = inView && !hold && lightbox === null && !reduce;

  const go = (n: number) => setActive((n + COUNT) % COUNT);
  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? (p.length > 1 ? p.filter((x) => x !== i) : p) : [...p, i].sort()));

  const text = t("waText", { roles: picked.map((i) => roles[i]).join(", ") });
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;
  const phone = company.phones[0];

  return (
    <section id="vjencanja" className="scroll-mt-24 px-3 py-3 sm:px-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#F6F2EC]">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),transparent)]" />

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-brand shadow-[0_14px_30px_-18px_rgba(17,17,19,0.5)] ring-1 ring-black/5">
              <Rings className="h-6 w-8" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-brand-strong">{t("eyebrow")}</p>
            <h2 className="mt-3 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-[3.4rem]">
              {t("title")} <span className="text-brand-strong">{t("accent")}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-foreground/65">{t("p1")}</p>
          </motion.header>

          <motion.div
            ref={stage}
            initial={reduce ? "open" : "veil"}
            whileInView="open"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12"
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
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
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(active + 1);
              if (e.key === "ArrowLeft") go(active - 1);
            }}
          >
          <motion.div
            variants={{
              veil: { clipPath: "inset(0% 50% 0% 50% round 28px)" },
              open: { clipPath: "inset(0% 0% 0% 0% round 28px)", transition: { duration: 1.4, ease: [0.65, 0, 0.35, 1] } },
            }}
            className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-ink sm:aspect-[16/9] lg:aspect-[2.2/1]"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute inset-0"
              >
                <motion.div
                  initial={{ scale: reduce ? 1 : 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 7, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={SRC[active]}
                    alt={t("imageAlt", { n: active + 1 })}
                    fill
                    sizes="(max-width: 1023px) 94vw, 1150px"
                    quality={88}
                    placeholder="blur"
                    blurDataURL={WED_BLUR[ORDER[active]]}
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

            <div className="absolute inset-x-4 top-4 flex gap-1.5 sm:inset-x-6 sm:top-5">
              {SRC.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={t("imageAlt", { n: i + 1 })}
                  aria-current={i === active || undefined}
                  className="relative h-4 flex-1"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/30">
                    {i < active && <span className="absolute inset-0 bg-white" />}
                    {i === active && (
                      <span
                        key={active}
                        onAnimationEnd={() => go(active + 1)}
                        className="absolute inset-0 origin-left bg-white"
                        style={{ animation: `ticker-fill ${MS}ms linear forwards`, animationPlayState: run ? "running" : "paused" }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLightbox(active)}
              aria-label={t("open")}
              className="absolute right-4 top-11 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/55 sm:right-6 sm:top-12"
            >
              <Expand className="h-4 w-4" />
            </button>

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <Heart className="h-3.5 w-3.5 fill-white" />
                <span className="tabular-nums">
                  {String(active + 1).padStart(2, "0")} <span className="text-white/60">/ {COUNT}</span>
                </span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(active - 1)}
                  aria-label={tc("prevImage")}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-transform hover:bg-white active:scale-90"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(active + 1)}
                  aria-label={tc("nextImage")}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-transform hover:bg-white active:scale-90"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
          </motion.div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE }}
              className="space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base"
            >
              <p>{t("p2")}</p>
              <p className="border-l-2 border-brand pl-4 text-foreground">{t("p3")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="rounded-[26px] bg-white p-5 shadow-[0_30px_60px_-44px_rgba(17,17,19,0.55)] ring-1 ring-black/5 sm:p-7"
            >
              <p className="font-display text-lg font-bold text-foreground">{t("rolesTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("rolesHint")}</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {roles.map((r, i) => {
                  const Icon = ROLE_ICONS[i] ?? Car;
                  const on = picked.includes(i);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggle(i)}
                      aria-pressed={on}
                      className={`relative flex items-center gap-3 rounded-2xl p-3 text-left text-sm font-semibold ring-1 transition-[background-color,box-shadow,color] duration-200 active:scale-[0.98] sm:p-3.5 ${
                        on ? "bg-brand/[0.06] text-foreground ring-2 ring-brand" : "bg-surface-muted/60 text-foreground/80 ring-transparent hover:ring-border"
                      }`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-200 ${on ? "bg-brand text-white" : "bg-white text-brand-strong"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 leading-snug">{r}</span>
                      <AnimatePresence>
                        {on && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 26 }}
                            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white ring-2 ring-white"
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <PillLink href={wa} icon={<WhatsAppIcon className="h-4 w-4" />}>
                  {t("cta")}
                </PillLink>
                {phone && (
                  <PillLink href={phone.href} variant="outline" icon={<Phone className="h-4 w-4" />}>
                    {t("call")}
                  </PillLink>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={SRC}
        title={`${t("title")} ${t("accent")}`}
        openIndex={lightbox}
        onClose={() => setLightbox(null)}
        thumbSizes="(max-width: 1023px) 94vw, 1150px"
      />
    </section>
  );
}
