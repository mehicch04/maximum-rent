"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand, Phone } from "lucide-react";
import { PillLink } from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import { WED_BLUR } from "./wedding-blur";

const ORDER = [7, 10, 5, 8, 6, 9];
const SRC = ORDER.map((id) => `/wed-${id}.webp`);
const BLUR = ORDER.map((id) => WED_BLUR[id]);
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

const DECK = 6;
const TILT = [-6, 7, -9, 5, -4, 8];
const SHIFT = [0, 26, -22, 16, -12, 8];

export function WeddingCarsSection() {
  const t = useTranslations("WeddingCars");
  const tc = useTranslations("Common");
  const company = useCompany();
  const roles = t.raw("roles") as string[];
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t("waText", { roles: roles.join(", ") }))}`;
  const phone = company.phones[0];
  const [order, setOrder] = useState(() => Array.from({ length: DECK }, (_, i) => i));

  const next = () => setOrder((o) => [...o.slice(1), o[0]]);
  const prev = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  const onEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) next();
  };

  return (
    <section id="vjencanja" className="scroll-mt-24 px-3 py-5 sm:px-4 sm:py-8">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-[#F6F2EC]">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: EASE }}>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-strong">
              <Rings className="h-4 w-6" />
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-[3.2rem]">
              {t("title")} <span className="text-brand-strong">{t("accent")}</span>
            </h2>
            <p className="mt-6 border-l-2 border-brand pl-4 text-lg leading-relaxed text-foreground">{t("p1")}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{t("p2")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
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

          <div>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px]">
              <AnimatePresence initial={false}>
                {order.map((idx, pos) => {
                  const top = pos === 0;
                  return (
                    <motion.div
                      key={idx}
                      drag={top ? "x" : false}
                      dragSnapToOrigin
                      onDragEnd={top ? onEnd : undefined}
                      initial={false}
                      animate={{ rotate: top ? 0 : TILT[idx % TILT.length], x: SHIFT[pos], y: pos * 10, scale: 1 - pos * 0.04, opacity: pos > 3 ? 0 : 1, zIndex: DECK - pos }}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      whileDrag={{ rotate: 4, scale: 1.02 }}
                      className={`absolute inset-x-[4%] top-[4%] rounded-[18px] bg-white p-2.5 pb-12 shadow-[0_30px_60px_-30px_rgba(17,17,19,0.55)] ring-1 ring-black/5 sm:p-3 sm:pb-14 ${top ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
                    >
                      <div className="relative aspect-[3/2] overflow-hidden rounded-[12px] bg-ink">
                        <Image src={SRC[idx]} alt={t("imageAlt", { n: idx + 1 })} fill sizes="(max-width: 1023px) 90vw, 520px" quality={88} placeholder="blur" blurDataURL={BLUR[idx]} draggable={false} className="object-cover" />
                      </div>
                      <p className="absolute inset-x-0 bottom-3.5 flex items-center justify-between px-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 sm:bottom-4">
                        <span>Maximum · {t("accent")}</span>
                        <span className="tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button type="button" onClick={prev} aria-label={tc("prevImage")} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-black/5 active:scale-90">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-muted-foreground ring-1 ring-black/5">
                <Hand className="h-3.5 w-3.5" />
                {String(order[0] + 1).padStart(2, "0")} / {DECK}
              </span>
              <button type="button" onClick={next} aria-label={tc("nextImage")} className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-sm active:scale-90">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
