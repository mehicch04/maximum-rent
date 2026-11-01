"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, CalendarHeart, Car, Headset, MapPin, Users, Wrench } from "lucide-react";

export type Stat = { icon: "users" | "car" | "years" | "pin" | "days" | "wrench" | "headset"; to: number; decimals?: number; prefix?: string; suffix?: string; label: string; fixed?: string };

const ICONS: Record<Stat["icon"], LucideIcon> = { users: Users, car: Car, years: CalendarHeart, pin: MapPin, days: CalendarDays, wrench: Wrench, headset: Headset };

function Num({ s, run, locale }: { s: Stat; run: boolean; locale: string }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? s.to : 0);
  useEffect(() => {
    if (!run || reduce) {
      if (reduce) setV(s.to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400);
      setV(s.to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, reduce, s.to]);
  if (s.fixed) return <>{s.fixed}</>;
  const shown = v.toLocaleString(locale, { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0 });
  return (
    <>
      {s.prefix}
      {shown}
      {s.suffix}
    </>
  );
}

export function CountStats({ stats, locale }: { stats: Stat[]; locale: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <ul ref={ref} className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = ICONS[s.icon];
        return (
          <motion.li
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-[24px] bg-surface p-5 ring-1 ring-border transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(227,6,19,0.35)] sm:p-6"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand-strong transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-5 font-display text-4xl font-bold tabular-nums tracking-tight text-foreground sm:text-5xl">
              <Num s={s} run={inView} locale={locale} />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </motion.li>
        );
      })}
    </ul>
  );
}
