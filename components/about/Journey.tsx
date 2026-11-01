"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { CheckCircle2, KeyRound, MailCheck, MapPin, Send } from "lucide-react";

const ICONS = [Send, MailCheck, KeyRound, MapPin];

export function Journey({ steps }: { steps: { t: string; d: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const [lit, setLit] = useState(reduce ? steps.length : 0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const n = Math.min(steps.length, Math.floor(v * steps.length + 0.35));
    setLit((p) => (n > p ? n : p));
  });

  return (
    <div ref={ref} className="relative">
      <span aria-hidden className="absolute bottom-6 left-[23px] top-6 w-0.5 rounded-full bg-border lg:bottom-auto lg:right-[12.5%] lg:left-[12.5%] lg:top-[23px] lg:h-0.5 lg:w-auto" />
      <motion.span
        aria-hidden
        style={{ scaleY: reduce ? 1 : fill }}
        className="absolute bottom-6 left-[23px] top-6 w-0.5 origin-top rounded-full bg-gradient-to-b from-brand-500 to-brand-300 lg:hidden"
      />
      <motion.span
        aria-hidden
        style={{ scaleX: reduce ? 1 : fill }}
        className="absolute right-[12.5%] left-[12.5%] top-[23px] hidden h-0.5 origin-left rounded-full bg-gradient-to-r from-brand-500 to-brand-300 lg:block"
      />
      <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
        {steps.map((s, i) => {
          const on = i < lit;
          const Icon = ICONS[i] ?? CheckCircle2;
          return (
            <li key={s.t} className="flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
              <span
                className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full ring-4 ring-background transition-[background-color,color,transform] duration-500 ${
                  on ? "scale-100 bg-brand text-white" : "scale-90 bg-surface-muted text-muted-foreground"
                }`}
              >
                {on && !reduce && <span className="absolute inset-0 rounded-full bg-brand/40 motion-safe:animate-[ping_1s_ease-out_1]" />}
                <Icon className="relative h-5 w-5" />
              </span>
              <div className={`transition-[opacity,transform] duration-500 lg:mt-6 ${on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-50"}`}>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-strong">0{i + 1}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground lg:mx-auto lg:max-w-[24ch]">{s.d}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
