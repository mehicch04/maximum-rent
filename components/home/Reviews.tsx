"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { MousePointer2, Pause, ShieldCheck, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { PillLink } from "@/components/ui/PillLink";
import { Heading } from "./Heading";

export type Review = { author: string; rating: number; text: string; time?: string; url?: string };
export type ReviewsData = { score: number; count: number; url: string; reviews: Review[] };

const ACCENTS = [
  { a: "#ED1822", b: "#9D0710" },
  { a: "#2C2C31", b: "#111113" },
  { a: "#FB5860", b: "#BE040F" },
  { a: "#52525B", b: "#27272A" },
];
const BRAND = "#E30613";
const SLOTS = 6;
const R = 15;
const C = 2 * Math.PI * R;
const STAGGER = 1700;
const readTime = (text: string) => Math.min(18000, Math.max(6500, 3500 + text.length * 50));
const EASE = [0.22, 1, 0.36, 1] as const;

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="flex shrink-0 gap-0.5" role="img" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={`${className} ${i < Math.round(value) ? "fill-[#F5A524] text-[#F5A524]" : "fill-border text-border"}`} />
      ))}
    </span>
  );
}

function Slot({
  review,
  idx,
  slot,
  rotate,
  live,
  href,
  onDone,
}: {
  review: Review;
  idx: number;
  slot: number;
  rotate: boolean;
  live: React.MutableRefObject<boolean>;
  href: string;
  onDone: (slot: number) => void;
}) {
  const t = useTranslations("Reviews");
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const acc = ACCENTS[idx % ACCENTS.length];
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [pinned, setPinned] = useState(false);
  const paused = hover || focus || pinned;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const elapsed = useRef(0);
  const dur = useRef(readTime(review.text) + slot * STAGGER);
  const busy = useRef(false);
  const ring = useRef<SVGCircleElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const secs = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  const self = useRef<HTMLLIElement>(null);

  const swap = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    if (!reduce) {
      const shake = controls.start({
        x: [0, -5, 5, -3, 3, -1, 0],
        rotate: [0, -1.2, 1.2, -0.7, 0.7, 0, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
      });
      await new Promise((r) => setTimeout(r, 220));
      onDone(slot);
      await shake;
    } else {
      onDone(slot);
    }
  }, [controls, onDone, reduce, slot]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    elapsed.current = 0;
    dur.current = readTime(review.text);
    busy.current = false;
  }, [idx, review.text]);

  useEffect(() => {
    if (!rotate) return;
    let raf = 0;
    let last = performance.now();
    let shown = -1;
    let drawn = -1;
    let vis = true;
    let checked = 0;
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      if (now - checked > 500) {
        checked = now;
        vis = !!self.current?.offsetParent;
      }
      if (vis && !pausedRef.current && live.current && !busy.current) {
        elapsed.current += dt;
        if (elapsed.current >= dur.current) void swap();
      }
      const left = Math.max(0, dur.current - elapsed.current);
      const frac = Math.round((left / dur.current) * 1000) / 1000;
      if (vis && live.current && frac !== drawn) {
        drawn = frac;
        if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - frac));
        if (bar.current) bar.current.style.transform = `scaleX(${frac})`;
      }
      const s = Math.ceil(left / 1000);
      if (s !== shown && secs.current) {
        shown = s;
        secs.current.textContent = String(s);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rotate, live, swap]);

  const initial = review.author.trim().charAt(0).toUpperCase() || "G";

  return (
    <li
      ref={self}
      className={`group/s relative transition-transform duration-300 ease-out ${paused ? "-translate-y-1" : ""} ${slot === 3 ? "hidden sm:block" : slot > 3 ? "hidden lg:block" : ""}`}
      style={{ "--acc": BRAND } as CSSProperties}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocus(false)}
      onClick={(e) => {
        if ((e.nativeEvent as PointerEvent).pointerType === "touch" && !(e.target as HTMLElement).closest("a,button")) setPinned((v) => !v);
      }}
    >
      <motion.article
        animate={controls}
        style={paused ? ({ "--tw-ring-color": `${BRAND}40` } as CSSProperties) : undefined}
        className={`relative isolate flex h-[330px] flex-col overflow-hidden rounded-[24px] bg-surface p-5 transition-[box-shadow] duration-300 sm:p-6 ${
          paused ? "shadow-[0_30px_60px_-38px_rgba(227,6,19,0.55)] ring-2" : "shadow-[0_1px_2px_rgba(11,18,32,0.04),0_18px_40px_-30px_rgba(11,18,32,0.35)] ring-1 ring-border"
        }`}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={idx}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(90% 60% at 0% 0%, rgba(227,6,19,0.06) 0%, transparent 70%)" }}
          />
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={idx}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className={`flex items-center gap-3 ${rotate ? "pr-12" : ""}`}>
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-semibold text-white shadow-[0_8px_18px_-12px_rgba(0,0,0,0.6)]"
                style={{ backgroundImage: `linear-gradient(135deg, ${acc.a}, ${acc.b})` }}
              >
                {initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground">
                  <bdi>{review.author}</bdi>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Stars value={review.rating} className="h-3.5 w-3.5" />
                  {review.time && <span className="truncate">{review.time}</span>}
                </span>
              </span>
            </div>
            <div className="relative mt-4 min-h-0 flex-1">
              <span aria-hidden className="absolute -left-1 -top-5 select-none font-display text-6xl font-bold leading-none text-brand opacity-[0.12]">
                &ldquo;
              </span>
              <blockquote className="relative line-clamp-7 pl-1 pt-2 text-[15px] leading-relaxed text-foreground/85">
                {review.text}
              </blockquote>
            </div>
            <a
              href={review.url ?? href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-strong underline-offset-4 hover:underline"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {t("verify")}
            </a>
          </motion.div>
        </AnimatePresence>

        {rotate && (
          <>
            <button
              type="button"
              onClick={() => void swap()}
              aria-label={t("next")}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-surface/90 backdrop-blur transition-transform duration-300 hover:scale-110 sm:right-5 sm:top-5"
            >
              <svg viewBox="0 0 36 36" aria-hidden className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="18" cy="18" r={R} fill="none" strokeWidth="3" className="stroke-border" />
                <circle ref={ring} cx="18" cy="18" r={R} fill="none" strokeWidth="3" strokeLinecap="round" stroke={BRAND} strokeDasharray={C} strokeDashoffset={0} />
              </svg>
              <span aria-hidden className={`relative text-[11px] font-semibold tabular-nums text-foreground transition-opacity duration-200 ${paused ? "opacity-0" : "opacity-100"}`}>
                <span ref={secs} />
              </span>
              <Pause aria-hidden className={`absolute h-3.5 w-3.5 fill-current text-brand transition-opacity duration-200 ${paused ? "opacity-100" : "opacity-0"}`} />
            </button>
            <span
              aria-hidden
              className={`pointer-events-none absolute bottom-5 right-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white transition-[opacity,transform] duration-300 sm:bottom-6 sm:right-6 ${
                paused ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
              style={{ backgroundColor: "#111113" }}
            >
              {t("paused")}
            </span>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-border/50">
              <span ref={bar} className="block h-full origin-left bg-brand/70" />
            </span>
          </>
        )}
      </motion.article>
    </li>
  );
}

export function Reviews({ data }: { data: ReviewsData }) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const pool = data.reviews;
  const slots = Math.min(SLOTS, pool.length);
  const rotate = pool.length > slots;
  const [shown, setShown] = useState(() => Array.from({ length: slots }, (_, i) => i));
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const cursor = useRef(slots);
  const live = useRef(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    const sync = () => {
      live.current = seen && document.visibilityState === "visible";
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      sync();
    }, { threshold: 0.25 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const advance = useCallback(
    (slot: number) => {
      const taken = new Set(shownRef.current);
      let n = cursor.current % pool.length;
      for (let i = 0; i < pool.length && taken.has(n); i++) n = (n + 1) % pool.length;
      cursor.current = n + 1;
      shownRef.current = shownRef.current.map((v, i) => (i === slot ? n : v));
      setShown(shownRef.current);
    },
    [pool.length],
  );

  const score = data.score.toLocaleString(locale === "en" ? "en-GB" : "hr-HR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const faces = pool.slice(0, 5);

  return (
    <section ref={root} className="px-3 py-3 sm:px-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-surface-muted/40 ring-1 ring-border/60">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <span className="absolute -left-32 -top-40 h-[460px] w-[460px] rounded-full bg-brand/[0.07] blur-3xl" />
          <span className="absolute -bottom-48 -right-24 h-[420px] w-[420px] rounded-full bg-brand/[0.06] blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} />
              {rotate && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <MousePointer2 className="h-3.5 w-3.5" />
                  {t("hint")}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex max-w-full items-center gap-3 rounded-full bg-surface/90 p-2 pr-5 sm:gap-4 sm:pr-6 shadow-[0_20px_40px_-30px_rgba(11,18,32,0.45)] ring-1 ring-border backdrop-blur transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className={`flex -space-x-2.5 ${faces.length ? "" : "hidden"}`}>
                  {faces.map((f, i) => {
                    const a = ACCENTS[i % ACCENTS.length];
                    return (
                      <span
                        key={`${f.author}${i}`}
                        className={`h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white ring-2 ring-surface transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-10 sm:w-10 ${i > 3 ? "hidden sm:grid" : "grid"}`}
                        style={{ backgroundImage: `linear-gradient(135deg, ${a.a}, ${a.b})`, transitionDelay: `${i * 40}ms` }}
                      >
                        {f.author.trim().charAt(0).toUpperCase()}
                      </span>
                    );
                  })}
                </span>
                <span>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-2xl font-semibold leading-none tracking-tight text-foreground">{score}</span>
                    <Stars value={data.score} />
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{t("count", { count: data.count })}</span>
                </span>
              </a>
              <div className="flex flex-wrap gap-2">
                <PillLink href="/vozila">{t("book")}</PillLink>
                <PillLink href={data.url} variant="outline">
                  {t("all")}
                </PillLink>
              </div>
            </div>
          </div>

          {pool.length > 0 && (
            <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((idx, slot) => (
                <Slot key={slot} review={pool[idx]} idx={idx} slot={slot} rotate={rotate} live={live} href={data.url} onDone={advance} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
