"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

function useTween(value: number, ms = 480) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || start === value) {
      from.current = value;
      setV(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const cur = start + (value - start) * (1 - Math.pow(1 - k, 3));
      from.current = cur;
      setV(cur);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

export function Amount({ value, className = "" }: { value: number; className?: string }) {
  const { currency } = useCurrency();
  const v = useTween(value);
  return (
    <bdi className={`tabular-nums ${className}`}>
      {formatPrice(v, currency)}
    </bdi>
  );
}

export function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  const [settled, setSettled] = useState(false);
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: EASE }}
          onAnimationStart={() => setSettled(false)}
          onAnimationComplete={(d) => setSettled((d as { height?: unknown }).height === "auto")}
          className={settled ? "overflow-visible" : "overflow-hidden"}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Step({
  n,
  done,
  title,
  lead,
  id,
  children,
}: {
  n: number;
  done?: boolean;
  title: string;
  lead?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[22px] bg-surface p-5 shadow-[0_1px_0_rgba(11,18,32,0.03)] ring-1 ring-border sm:p-6">
      <h2 className="flex items-center gap-3 font-display text-base font-semibold text-foreground sm:text-lg">
        <span
          className={`relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-semibold transition-colors duration-300 ${
            done ? "bg-emerald-500 text-white" : "bg-foreground text-background"
          }`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {done ? (
              <motion.span key="d" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.span>
            ) : (
              <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.2 }}>
                {n}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {title}
      </h2>
      {lead && <p className="mt-1.5 ps-10 text-[13px] text-muted-foreground">{lead}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Choice({
  name,
  checked,
  onChange,
  title,
  note,
  icon,
  price,
  badge,
  disabled,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  note?: string;
  icon?: ReactNode;
  price?: ReactNode;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`group relative flex items-center gap-3 rounded-2xl p-3.5 transition-[background-color,box-shadow,transform] duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/60 sm:gap-3.5 sm:p-4 ${
        checked ? "bg-brand/[0.06] ring-2 ring-brand" : "bg-surface-muted ring-1 ring-transparent hover:ring-border"
      } ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer active:scale-[0.993]"}`}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 bg-surface transition-colors duration-200 ${
          checked ? "border-brand" : "border-foreground/25 group-hover:border-foreground/40"
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full bg-brand transition-transform duration-200 ${checked ? "scale-100" : "scale-0"}`} />
      </span>
      {icon && (
        <span
          aria-hidden
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-[background-color,color,transform] duration-300 ${
            checked ? "rotate-[-4deg] bg-brand text-white" : "bg-brand/10 text-brand-strong"
          }`}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
          {title}
          {badge && (
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200">{badge}</span>
          )}
        </span>
        {note && <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{note}</span>}
        {price && (
          <span
            className={`mt-2 inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200 sm:hidden ${
              checked ? "bg-brand text-white" : "bg-surface text-brand-strong ring-1 ring-border"
            }`}
          >
            {price}
          </span>
        )}
      </span>
      {price && (
        <span
          className={`hidden shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 sm:inline-flex ${
            checked ? "bg-brand text-white" : "bg-surface text-brand-strong ring-1 ring-border"
          }`}
        >
          {price}
        </span>
      )}
    </label>
  );
}

export function Stepper({
  value,
  max,
  onChange,
  name,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  name: string;
}) {
  const te = useTranslations("Extras");
  const btn =
    "grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border transition-[background-color,transform] hover:bg-surface-muted active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100";
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={btn} disabled={value <= 0} onClick={() => onChange(value - 1)} aria-label={te("decrease", { name })}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="relative grid h-9 w-8 place-items-center overflow-hidden text-sm font-semibold tabular-nums text-foreground" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={te("increase", { name })}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className={`relative inline-flex shrink-0 items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} aria-label={label} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-7 w-12 rounded-full bg-foreground/15 transition-colors duration-300 after:absolute after:start-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.25)] after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] peer-checked:bg-brand peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface peer-disabled:opacity-40"
      />
    </label>
  );
}

export function useStickyTop(ref: React.RefObject<HTMLElement>, gap = 96) {
  const [top, setTop] = useState(gap);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setTop(Math.min(gap, window.innerHeight - el.offsetHeight - 24));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [ref, gap]);
  return top;
}
