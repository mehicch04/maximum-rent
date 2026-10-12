"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CarFront, Send, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "./SectionHeading";

const ease = [0.22, 1, 0.36, 1] as const;
const ICONS = [CarFront, Send, KeyRound];

/** How long each step stays active before the sequence advances. */
const STEP_MS = 2800;

export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = t.raw("steps") as { title: string; body: string }[];

  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || !inView || paused) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % steps.length),
      STEP_MS,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, inView, paused, steps.length]);

  const take = useCallback((i: number) => {
    setActive(i);
    setPaused(true);
  }, []);
  const release = useCallback(() => setPaused(false), []);

  const isActive = (i: number) => reduceMotion || i === active;

  // Fill spans from the first icon centre to the last: 0, half, full.
  const progress = steps.length > 1 ? active / (steps.length - 1) : 1;

  return (
    <section
      ref={sectionRef}
      className="border-y border-border bg-surface-muted/40"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="center"
        />

        <div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Track + progress fill between the icon centres (desktop only). */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-7 hidden md:block"
          >
            <div className="mx-auto h-px w-2/3 overflow-hidden bg-border/70">
              <motion.div
                className="h-full origin-left bg-brand"
                initial={false}
                animate={{ scaleX: reduceMotion ? 1 : progress }}
                transition={{ duration: 0.7, ease }}
              />
            </div>
          </div>

          {steps.map((step, i) => {
            const Icon = ICONS[i] ?? CarFront;
            const on = isActive(i);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease }}
                className="relative flex flex-col items-center text-center"
              >
                <button
                  type="button"
                  onMouseEnter={() => take(i)}
                  onMouseLeave={release}
                  onFocus={() => take(i)}
                  onBlur={release}
                  onClick={() => take(i)}
                  aria-current={i === active ? "step" : undefined}
                  aria-label={`${i + 1}. ${step.title}`}
                  className="relative z-10 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <motion.span
                    aria-hidden
                    className="absolute -inset-2 rounded-[1.35rem] bg-brand/10"
                    initial={false}
                    animate={{
                      opacity: on && !reduceMotion ? 1 : 0,
                      scale: on && !reduceMotion ? 1 : 0.85,
                    }}
                    transition={{ duration: 0.45, ease }}
                  />

                  <motion.span
                    className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground ${
                      on ? "shadow-card" : "shadow-card"
                    }`}
                    initial={false}
                    animate={{ scale: on && !reduceMotion ? 1.08 : 1 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <Icon className="h-6 w-6" />

                    <motion.span
                      className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                        on
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border bg-surface text-brand-strong"
                      }`}
                      initial={false}
                      animate={{ scale: on && !reduceMotion ? 1.06 : 1 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      {i + 1}
                    </motion.span>
                  </motion.span>
                </button>

                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>

                {/* Short underline that only the active step carries. */}
                <motion.span
                  aria-hidden
                  className="mt-4 h-0.5 w-10 origin-center rounded-full bg-brand"
                  initial={false}
                  animate={{
                    scaleX: on && !reduceMotion ? 1 : 0,
                    opacity: on && !reduceMotion ? 1 : 0,
                  }}
                  transition={{ duration: 0.45, ease }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
