"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RoadSign, type SignKind } from "./RoadSign";

export type Fine = { kind: SignKind; label: string; amount: string };

const MS = 4800;
const LIMIT = 50;
const CAUGHT = 64;

function Radar({ run }: { run: boolean }) {
  const [v, setV] = useState(run ? 38 : CAUGHT);
  useEffect(() => {
    if (!run) {
      setV(CAUGHT);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 900);
      setV(Math.round(38 + (CAUGHT - 38) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  const over = v > LIMIT;
  return (
    <span
      className={`inline-flex items-baseline gap-1 rounded-md px-2 py-0.5 font-mono text-sm font-bold tabular-nums ring-1 transition-colors duration-200 ${
        over ? "bg-red-500/15 text-red-400 ring-red-500/40" : "bg-white/5 text-emerald-300 ring-white/10"
      }`}
    >
      {v}
      <span className="text-[10px] font-semibold opacity-70">km/h</span>
    </span>
  );
}

export function FineTicker({ fines, title, cta, href, slideLabel }: { fines: Fine[]; title: string; cta: string; href: string; slideLabel: string }) {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "-80px" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [round, setRound] = useState(0);
  const running = inView;
  const f = fines[i];

  const go = (n: number) => {
    setI((n + fines.length) % fines.length);
    setRound((r) => r + 1);
  };

  if (!f) return null;
  const cut = f.amount.indexOf(" (");
  const main = cut > 0 ? f.amount.slice(0, cut) : f.amount;
  const sub = cut > 0 ? f.amount.slice(cut + 2).replace(/\)$/, "") : "";

  return (
    <div
      ref={box}
      className="relative w-full overflow-hidden rounded-[24px] bg-white/[0.045] p-5 ring-1 ring-white/10 backdrop-blur-sm sm:p-6"
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#FF3B30_0%,#FF3B30_46%,transparent_46%,transparent_54%,#2F7BFF_54%,#2F7BFF_100%)] opacity-80" />
      {!reduce && f.kind === "speed" && inView && (
        <span
          key={`flash-${round}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-white opacity-0"
          style={{ animation: "cam-flash 0.55s ease-out 0.95s 1 both" }}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
          <span aria-hidden className="flex gap-1">
            <span
              className="h-2 w-4 rounded-full bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]"
              style={reduce || !running ? { opacity: 0.35 } : { animation: "siren-red 0.9s linear infinite" }}
            />
            <span
              className="h-2 w-4 rounded-full bg-[#2F7BFF] shadow-[0_0_10px_#2F7BFF]"
              style={reduce || !running ? { opacity: 0.35 } : { animation: "siren-blue 0.9s linear infinite" }}
            />
          </span>
          {title}
        </span>
        <span className="text-xs tabular-nums text-white/40">
          {i + 1}/{fines.length}
        </span>
      </div>

      <div className="mt-5 flex min-h-[104px] items-center gap-5">
        <div className="relative h-[76px] w-[76px] shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`s-${i}-${round}`}
              initial={reduce ? false : { rotate: -22, y: -14, opacity: 0 }}
              animate={{ rotate: 0, y: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              transition={{ rotate: { type: "spring", stiffness: 240, damping: 9 }, y: { type: "spring", stiffness: 240, damping: 14 }, opacity: { duration: 0.2 } }}
              className="absolute inset-0 origin-top"
            >
              <RoadSign kind={f.kind} value={LIMIT} className="h-full w-full" />
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`t-${i}-${round}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {f.kind === "speed" && (
                <span className="mb-2 block">
                  <Radar run={!reduce && inView} />
                </span>
              )}
              <p className="text-sm leading-snug text-white/70">{f.label}</p>
              <motion.p
                initial={reduce ? false : { scale: 1.25, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: f.kind === "speed" ? 1 : 0.25, type: "spring", stiffness: 420, damping: 18 }}
                className="mt-1.5 flex flex-wrap items-baseline gap-x-2 origin-[0%_50%]"
              >
                <span className="font-display text-2xl font-bold text-white sm:text-[1.7rem]">{main}</span>
                {sub && <span className="text-xs text-white/50">{sub}</span>}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex flex-1 gap-1.5">
          {fines.map((x, j) => (
            <button
              key={x.label}
              type="button"
              onClick={() => go(j)}
              aria-label={`${slideLabel} ${j + 1}`}
              aria-current={j === i || undefined}
              className="relative h-6 flex-1"
            >
              <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
                {j < i && <span className="absolute inset-0 rounded-full bg-white/45" />}
                {j === i && (
                  <span
                    key={`p-${round}`}
                    onAnimationEnd={() => go(i + 1)}
                    className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#FF3B30] to-[#2F7BFF]"
                    style={{ animation: `ticker-fill ${MS}ms linear forwards`, animationPlayState: running ? "running" : "paused" }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
        <Link href={href} className="group/cta inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-300 hover:text-white">
          {cta}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
