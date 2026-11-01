"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Plane } from "lucide-react";
import { useTranslations } from "next-intl";
import { PillLink } from "@/components/ui/PillLink";
import { Heading } from "./Heading";

const BARS = [3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 1, 2, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2];

type Pass = {
  code: string;
  label: string;
  from: string;
  to: string;
  you: string;
  youSub: string;
  destSub: string;
  step: string;
  payLabel: string;
  pay: string;
  stamps: string[];
};

export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = t.raw("steps") as { title: string; body: string }[];
  const pass = t.raw("pass") as Pass;
  const count = steps.length;
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { once: true, margin: "-140px" });
  const [stamped, setStamped] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [again, setAgain] = useState<number[]>(() => steps.map(() => 0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setStamped(count);
      return;
    }
    const ids = Array.from({ length: count }, (_, i) => window.setTimeout(() => setStamped(i + 1), 900 + i * 650));
    return () => ids.forEach(clearTimeout);
  }, [inView, reduce, count]);

  const caps = "uppercase tracking-[0.2em]";

  return (
    <section className="px-3 sm:px-4">
      <div className="relative overflow-hidden rounded-[28px] bg-ink py-20 dark:ring-1 dark:ring-white/10 sm:py-24">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_88%_0%,rgba(227,6,19,0.2),transparent_70%),radial-gradient(45%_40%_at_0%_100%,rgba(227,6,19,0.1),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} tone="dark" />
            <p className="max-w-sm text-sm leading-relaxed text-white/60 lg:pb-1">{t("lead")}</p>
          </div>

          <motion.div
            ref={box}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 flex flex-col overflow-hidden rounded-[26px] bg-white text-ink shadow-[0_40px_90px_-40px_rgba(227,6,19,0.45)] lg:flex-row"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-4 text-white sm:gap-4 sm:px-8">
                <span className="whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.12em] sm:text-sm sm:tracking-[0.25em]">
                  Maximum Rent a Car
                </span>
                <span className={`whitespace-nowrap text-[9px] font-semibold text-white/75 max-[359px]:hidden sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.2em]`}>{pass.label}</span>
              </div>

              <div className="flex items-center gap-3 px-5 pt-7 sm:gap-6 sm:px-8">
                <div>
                  <p className={`text-[10px] font-semibold text-ink/40 ${caps}`}>{pass.from}</p>
                  <p className="font-display text-3xl font-bold uppercase leading-none sm:text-4xl">{pass.you}</p>
                  <p className="mt-1 text-balance text-[11px] text-ink/50">{pass.youSub}</p>
                </div>
                <div aria-hidden className="relative h-8 flex-1">
                  <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-ink/15" />
                  <motion.span
                    initial={{ x: reduce ? "0%" : "-100%" }}
                    animate={inView ? { x: "0%" } : {}}
                    transition={{ duration: 2.4, ease: [0.45, 0, 0.2, 1], delay: 0.3 }}
                    className="absolute inset-0"
                  >
                    <span className="absolute right-0 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-brand-50 text-brand-700 translate-x-1/2">
                      <Plane className="h-4 w-4 rotate-45" />
                    </span>
                  </motion.span>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-semibold text-ink/40 ${caps}`}>{pass.to}</p>
                  <p className="font-display text-3xl font-bold leading-none sm:text-4xl">{pass.code}</p>
                  <p className="mt-1 text-balance text-[11px] text-ink/50">{pass.destSub}</p>
                </div>
              </div>

              <ol className="mt-7 grid border-t-2 border-dashed border-ink/10 md:grid-cols-3">
                {steps.map((s, i) => {
                  const word = pass.stamps[i] ?? "";
                  return (
                    <li
                      key={s.title}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => stamped > i && setAgain((a) => a.map((v, j) => (j === i ? v + 1 : v)))}
                      className={`relative p-5 transition-colors duration-300 sm:p-8 ${i > 0 ? "border-t-2 border-dashed border-ink/10 md:border-l-2 md:border-t-0" : ""} ${
                        hover === i ? "bg-brand-50/70" : ""
                      }`}
                    >
                      <p className={`text-[10px] font-semibold text-ink/40 ${caps}`}>
                        {pass.step} {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-bold md:pr-10">{s.title}</h3>
                      <p className="mt-2 max-w-[30ch] pr-12 text-sm leading-relaxed text-ink/60 md:pr-0">{s.body}</p>
                      <AnimatePresence>
                        {stamped > i && (
                          <motion.span
                            key={again[i]}
                            aria-hidden
                            initial={reduce ? false : { opacity: 0, scale: 1.9, rotate: -24 }}
                            animate={{ opacity: 1, scale: hover === i ? 1.06 : 1, rotate: -12 }}
                            transition={{ type: "spring", stiffness: 520, damping: 22 }}
                            className="pointer-events-none absolute right-3 top-3 h-[62px] w-[62px] text-brand-600/90 mix-blend-multiply sm:right-4 sm:top-4"
                          >
                            <svg viewBox="0 0 64 64" className="h-full w-full">
                              <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
                              <circle cx="32" cy="32" r="25.5" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
                              <path d="M26 22.5l4 4 8-8.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                              <text
                                x="32"
                                y="41"
                                textAnchor="middle"
                                fill="currentColor"
                                fontSize={8.5}
                                letterSpacing={0.6}
                                className="font-display font-bold uppercase"
                                {...(word.length * 7.2 > 40 ? { textLength: 40, lengthAdjust: "spacingAndGlyphs" } : {})}
                              >
                                {word}
                              </text>
                            </svg>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="relative flex flex-col items-center justify-center gap-5 border-t-2 border-dashed border-ink/10 bg-slate-50 px-8 py-8 lg:w-[260px] lg:border-l-2 lg:border-t-0">
              <span aria-hidden className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-ink lg:block" />
              <span aria-hidden className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-ink lg:block" />
              <div className="text-center">
                <p className={`text-[10px] font-semibold text-ink/40 ${caps}`}>{pass.payLabel}</p>
                <p className="font-display text-lg font-semibold">{pass.pay}</p>
              </div>
              <span aria-hidden className="flex h-14 items-stretch gap-[2px]">
                {BARS.map((w, i) => (
                  <span key={i} className="bg-ink" style={{ width: w }} />
                ))}
              </span>
              <PillLink href="/vozila" variant="brand">
                {t("cta")}
              </PillLink>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
