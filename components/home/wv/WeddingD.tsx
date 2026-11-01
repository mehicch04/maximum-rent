"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Phone } from "lucide-react";
import { PillLink } from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BLUR, Rings, SRC, useWedding } from "./shared";

const SHOW = 7;

export function WeddingD() {
  const { t, wa, phone } = useWedding();
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const m = () => setDist(Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth + 48));
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);

  const intro = (
    <div className="flex w-[82vw] max-w-[440px] shrink-0 flex-col justify-center text-white sm:w-[440px]">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
        <Rings className="h-4 w-6 text-brand-400" />
        {t("eyebrow")}
      </p>
      <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-[3.2rem]">
        {t("title")} <span className="text-brand-400">{t("accent")}</span>
      </h2>
      <p className="mt-5 text-lg leading-relaxed text-white/70">{t("p1")}</p>
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
    </div>
  );

  const cards = SRC.slice(0, SHOW).map((src, k) => (
    <figure key={src} className={`relative shrink-0 overflow-hidden rounded-[24px] bg-ink-700 ${k % 2 ? "h-[46vh] w-[60vw] sm:w-[38vh]" : "h-[56vh] w-[72vw] sm:w-[72vh]"} max-h-[520px] lg:mt-0`}>
      <Image src={src} alt={t("imageAlt", { n: k + 1 })} fill sizes="(max-width: 1023px) 80vw, 640px" quality={86} placeholder="blur" blurDataURL={BLUR[k]} className="object-cover" />
      <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-md">{String(k + 1).padStart(2, "0")}</span>
    </figure>
  ));

  return (
    <section id="vjencanja" className="scroll-mt-24 px-3 py-5 sm:px-4 sm:py-8">
      <div className="overflow-hidden rounded-[28px] bg-ink lg:hidden">
        <div className="px-5 pb-6 pt-16">{intro}</div>
        <div className="no-scrollbar flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-5 pb-12">
          {cards.map((c, k) => (
            <div key={k} className="snap-center">
              {c}
            </div>
          ))}
        </div>
      </div>
      <div ref={wrap} className="relative hidden h-[320vh] lg:block">
        <div className="sticky top-[76px] flex h-[calc(100vh-92px)] items-center overflow-hidden rounded-[28px] bg-ink">
          <div aria-hidden className="pointer-events-none absolute -left-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.28),transparent)]" />
          <motion.div ref={track} style={{ x }} className="relative flex items-center gap-6 pl-16 pr-24">
            {intro}
            <div className="w-10 shrink-0" />
            {cards}
          </motion.div>
          <div className="absolute inset-x-16 bottom-8 h-[3px] overflow-hidden rounded-full bg-white/10">
            <motion.span style={{ scaleX: bar }} className="block h-full origin-left bg-brand" />
          </div>
        </div>
      </div>
    </section>
  );
}
