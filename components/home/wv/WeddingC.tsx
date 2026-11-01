"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Expand, Phone } from "lucide-react";
import { PillLink } from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BLUR, EASE, Rings, SRC, useWedding } from "./shared";

const TILES = [0, 1, 2, 3, 4];
const SPAN = ["col-span-2 row-span-2", "", "", "", ""];

export function WeddingC() {
  const { t, wa, phone } = useWedding();
  return (
    <section id="vjencanja" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: EASE }}>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-strong">
            <Rings className="h-4 w-6" />
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-[3.2rem]">
            {t("title")} <span className="text-brand-strong">{t("accent")}</span>
          </h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1, ease: EASE }}>
          <p className="text-lg leading-relaxed text-muted-foreground">{t("p1")} {t("p3")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
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

      <div className="mt-12 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] lg:auto-rows-[230px] lg:grid-cols-4">
        {TILES.map((k, n) => (
          <motion.figure
            key={k}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: n * 0.08, ease: EASE }}
            className={`group relative overflow-hidden rounded-[22px] bg-ink ${SPAN[n]}`}
          >
            <Image src={SRC[k]} alt={t("imageAlt", { n: k + 1 })} fill sizes={n === 0 ? "(max-width: 1023px) 100vw, 560px" : "(max-width: 1023px) 50vw, 280px"} quality={86} placeholder="blur" blurDataURL={BLUR[k]} className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Expand className="h-4 w-4" />
            </span>
            {n === 0 && (
              <figcaption className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur">
                <Rings className="h-3 w-5 text-brand" />
                {t("eyebrow")}
              </figcaption>
            )}
          </motion.figure>
        ))}
      </div>
      <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{t("p2")}</p>
    </section>
  );
}
