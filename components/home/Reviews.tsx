"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView, useReducedMotion } from "framer-motion";
import { MousePointer2, Pause, ShieldCheck, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { PillLink } from "@/components/ui/PillLink";
import { Heading } from "./Heading";
import { intlLocale } from "@/i18n/routing";

export type Review = { author: string; rating: number; text: string; time?: string; url?: string };
export type ReviewsData = { score: number; count: number; url: string; reviews: Review[] };

const ACCENTS = [
  { a: "#ED1822", b: "#9D0710" },
  { a: "#2C2C31", b: "#111113" },
  { a: "#FB5860", b: "#BE040F" },
  { a: "#52525B", b: "#27272A" },
];
const BRAND = "#E30613";
const SLOTS = 4;
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

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
    </svg>
  );
}

function useCount(to: number, run: boolean, ms = 1400) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, reduce, ms]);
  return v;
}

function ScoreCard({ data, faces }: { data: ReviewsData; faces: Review[] }) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const run = useInView(ref, { once: true, margin: "-80px" });
  const v = useCount(data.score, run);
  const nf = intlLocale(locale);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative isolate overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-[0_40px_80px_-44px_rgba(17,17,19,0.8)] sm:p-8"
    >
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.45),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.06),transparent)]" />

      <span className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-white/80 ring-1 ring-white/10">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
          <GoogleG className="h-4 w-4" />
        </span>
        {t("google")}
      </span>

      <div className="mt-8 flex items-end gap-2">
        <span className="font-display text-[5.25rem] font-bold leading-[0.85] tracking-tight tabular-nums sm:text-[6rem]">
          {v.toLocaleString(nf, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
        <span className="mb-1.5 text-lg font-semibold text-white/35">/ 5</span>
      </div>

      <div className="mt-5 flex gap-1.5" role="img" aria-label={`${data.score}/5`}>
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, data.score - i));
          return (
            <span key={i} className="relative h-7 w-7">
              <Star aria-hidden className="absolute inset-0 h-7 w-7 fill-white/10 text-white/10" />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-700 ease-out"
                style={{ width: run ? `${fill * 100}%` : "0%", transitionDelay: `${300 + i * 140}ms` }}
              >
                <Star aria-hidden className="h-7 w-7 max-w-none fill-[#F5A524] text-[#F5A524]" />
              </span>
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-white/60">{t("count", { count: data.count })}</p>

      {faces.length > 0 && (
        <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
          <span className="flex -space-x-2.5">
            {faces.map((f, i) => {
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <span
                  key={`${f.author}${i}`}
                  className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white ring-2 ring-ink"
                  style={{ backgroundImage: `linear-gradient(135deg, ${a.a}, ${a.b})` }}
                >
                  {f.author.trim().charAt(0).toUpperCase()}
                </span>
              );
            })}
          </span>
          <span className="text-xs leading-snug text-white/55">{t("recent")}</span>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <PillLink href={data.url} variant="light">
          {t("all")}
        </PillLink>
        <PillLink href="/vozila">{t("book")}</PillLink>
      </div>
    </motion.div>
  );
}

function Proof() {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const ref = useRef<HTMLUListElement>(null);
  const run = useInView(ref, { once: true, margin: "-60px" });
  const labels = t.raw("proof") as string[];
  const values = [
    { to: 4532, suffix: "+" },
    { to: new Date().getFullYear() - 2009 },
    { to: 365 },
  ];
  return (
    <ul ref={ref} className="mt-10 grid grid-cols-3 gap-2 sm:gap-3">
      {values.map((s, i) => (
        <ProofTile key={i} to={s.to} suffix={s.suffix} label={labels[i] ?? ""} run={run} delay={i * 0.08} nf={intlLocale(locale)} />
      ))}
    </ul>
  );
}

function ProofTile({ to, suffix, label, run, delay, nf }: { to: number; suffix?: string; label: string; run: boolean; delay: number; nf: string }) {
  const v = useCount(to, run);
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={run ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="rounded-[20px] bg-surface p-3.5 ring-1 ring-border transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(227,6,19,0.35)] sm:rounded-[22px] sm:p-6"
    >
      <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
        {Math.round(v).toLocaleString(nf)}
        {suffix && <span className="text-brand-strong">{suffix}</span>}
      </p>
      <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2 sm:text-sm">{label}</p>
    </motion.li>
  );
}

export function Reviews({ data }: { data: ReviewsData }) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const pool = data.reviews;
  const has = pool.length > 0;
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

  const score = data.score.toLocaleString(intlLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section ref={root} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className={`grid gap-10 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-14 ${has ? "lg:items-start" : "lg:items-center"}`}>
        <div className={has ? "lg:sticky lg:top-28" : ""}>
          <ScoreCard data={data} faces={pool.slice(0, 5)} />
        </div>
        <div>
          <Heading
            eyebrow={t("eyebrow")}
            title={has ? t("title") : t("proofTitle")}
            accent={has ? t("accent") : t("proofAccent")}
            subtitle={has ? undefined : t("proofLead", { score })}
          />
          {rotate && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
              <MousePointer2 className="h-3.5 w-3.5" />
              {t("hint")}
            </p>
          )}
          {has ? (
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {shown.map((idx, slot) => (
                <Slot key={slot} review={pool[idx]} idx={idx} slot={slot} rotate={rotate} live={live} href={data.url} onDone={advance} />
              ))}
            </ul>
          ) : (
            <Proof />
          )}
        </div>
      </div>
    </section>
  );
}
