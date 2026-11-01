"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import { PillLink } from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BLUR, EASE, Rings, SRC, useAuto, useWedding } from "./shared";

const SHOW = 6;

export function WeddingA() {
  const { t, wa, phone } = useWedding();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const [hold, setHold] = useState(false);
  const [i, go] = useAuto(SHOW, 6000, inView && !hold && !reduce);

  return (
    <section id="vjencanja" className="scroll-mt-24 px-3 py-5 sm:px-4 sm:py-8">
      <div ref={ref} className="relative isolate flex min-h-[680px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink sm:min-h-[720px]">
        <AnimatePresence initial={false}>
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }} className="absolute inset-0 -z-10">
            <motion.div initial={{ scale: reduce ? 1 : 1.12 }} animate={{ scale: 1.02 }} transition={{ duration: 8, ease: "easeOut" }} className="absolute inset-0">
              <Image src={SRC[i]} alt={t("imageAlt", { n: i + 1 })} fill sizes="100vw" quality={88} placeholder="blur" blurDataURL={BLUR[i]} className="object-cover" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/10 lg:bg-gradient-to-r lg:from-black/85 lg:via-black/45 lg:to-transparent" />

        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-8 pt-28 sm:px-6 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="max-w-xl text-white">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              <Rings className="h-4 w-6 text-brand-400" />
              {t("eyebrow")}
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {t("title")} <span className="text-brand-400">{t("accent")}</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/75">{t("p1")}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/55">{t("p3")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink href={wa} icon={<WhatsAppIcon className="h-4 w-4" />}>
                {t("cta")}
              </PillLink>
              {phone && (
                <PillLink href={phone.href} variant="light" icon={<Phone className="h-4 w-4" />}>
                  {t("call")}
                </PillLink>
              )}
            </div>
          </motion.div>

          <div onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {SRC.slice(0, SHOW).map((src, k) => (
              <button
                key={src}
                type="button"
                onClick={() => go(k)}
                aria-label={t("imageAlt", { n: k + 1 })}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl transition-[transform,opacity] duration-300 sm:h-20 sm:w-28 ${k === i ? "opacity-100 ring-2 ring-white" : "opacity-55 hover:opacity-90"}`}
              >
                <Image src={src} alt="" fill sizes="112px" className="object-cover" />
                {k === i && <span key={i} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-brand" style={{ animation: `ticker-fill 6000ms linear forwards`, animationPlayState: inView && !hold ? "running" : "paused" }} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
