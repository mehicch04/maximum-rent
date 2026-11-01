"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function StoryCollage({
  main,
  side,
  mainAlt,
  sideAlt,
  score,
  reviews,
  badge,
}: {
  main: string;
  side: string;
  mainAlt: string;
  sideAlt: string;
  score: string;
  reviews: string;
  badge: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yMain = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [24, -24]);
  const ySide = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [56, -40]);

  return (
    <div ref={ref} className="relative mx-auto aspect-[1/0.92] w-full max-w-[560px]">
      <motion.div
        style={{ y: yMain }}
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="absolute left-0 top-0 h-[78%] w-[82%] overflow-hidden rounded-[30px] bg-ink shadow-[0_40px_80px_-40px_rgba(17,17,19,0.6)]"
      >
        <Image src={main} alt={mainAlt} fill sizes="(max-width: 1023px) 80vw, 460px" className="object-cover" />
      </motion.div>

      <motion.div
        style={{ y: ySide }}
        initial={{ opacity: 0, x: 24, rotate: 3 }}
        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        className="absolute bottom-0 right-0 h-[48%] w-[56%] overflow-hidden rounded-[26px] bg-surface shadow-[0_40px_80px_-36px_rgba(17,17,19,0.55)] ring-[6px] ring-background"
      >
        <Image src={side} alt={sideAlt} fill sizes="(max-width: 1023px) 55vw, 320px" className="object-cover" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
        className="absolute bottom-[12%] left-[-2%] flex items-center gap-3 rounded-2xl bg-surface/95 px-4 py-3 shadow-[0_24px_50px_-24px_rgba(17,17,19,0.55)] ring-1 ring-border backdrop-blur sm:left-[-4%]"
      >
        <span className="font-display text-2xl font-semibold leading-none text-foreground">{score}</span>
        <span>
          <span className="flex gap-0.5" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#F5A524] text-[#F5A524]" />
            ))}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">{reviews}</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
        className="absolute right-[4%] top-[6%] inline-flex items-center gap-2 rounded-full bg-ink/85 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur"
      >
        <span className="relative grid h-2.5 w-2.5 place-items-center">
          <span className="absolute inset-0 rounded-full bg-emerald-400/60 motion-safe:animate-ping" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        {badge}
      </motion.div>
    </div>
  );
}
