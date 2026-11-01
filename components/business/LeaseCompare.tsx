"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";

export function LeaseCompare({
  rows,
  options,
  labels,
}: {
  rows: string[];
  options: [string, string];
  labels: [string, string];
}) {
  const [mode, setMode] = useState(0);
  const reduce = useReducedMotion();
  const on = mode === 0;
  const score = on ? rows.length : 0;

  return (
    <div className="overflow-hidden rounded-[28px] bg-surface ring-1 ring-border shadow-[0_30px_60px_-44px_rgba(17,17,19,0.5)]">
      <div className="flex flex-col gap-5 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div role="tablist" className="relative grid grid-cols-2 rounded-full bg-surface-muted p-1">
          {options.map((o, i) => (
            <button
              key={o}
              type="button"
              role="tab"
              aria-selected={mode === i}
              onClick={() => setMode(i)}
              className={`relative z-10 h-10 rounded-full px-4 text-sm font-semibold transition-colors duration-300 sm:px-6 ${mode === i ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {mode === i && (
                <motion.span
                  layoutId="lease-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className={`absolute inset-0 -z-10 rounded-full ${i === 0 ? "bg-brand" : "bg-ink"}`}
                />
              )}
              {o}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 sm:min-w-[240px]">
          <span className="font-display text-3xl font-bold tabular-nums text-foreground">
            {score}
            <span className="text-base font-semibold text-muted-foreground">/{rows.length}</span>
          </span>
          <div className="flex-1">
            <span className="block h-2 overflow-hidden rounded-full bg-surface-muted">
              <motion.span
                className="block h-full origin-left rounded-full bg-brand"
                animate={{ scaleX: score / rows.length }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
              />
            </span>
            <span className="mt-1.5 block text-xs text-muted-foreground">{labels[mode]}</span>
          </div>
        </div>
      </div>

      <ul className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
        {rows.map((row, i) => (
          <li
            key={row}
            className={`flex items-center gap-3.5 px-4 py-3.5 sm:px-6 sm:[&:nth-child(n+3)]:border-t sm:[&:nth-child(even)]:border-l sm:border-border ${on ? "" : "text-muted-foreground"}`}
          >
            <span className="relative grid h-7 w-7 shrink-0 place-items-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mode}
                  initial={reduce ? false : { scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, transition: { duration: 0.12 } }}
                  transition={{ type: "spring", stiffness: 520, damping: 26, delay: reduce ? 0 : i * 0.03 }}
                  className={`absolute inset-0 grid place-items-center rounded-full ${on ? "bg-brand text-white" : "bg-surface-muted text-muted-foreground ring-1 ring-border"}`}
                >
                  {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={2.5} />}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className={`text-sm leading-snug transition-colors duration-300 ${on ? "text-foreground" : "line-through decoration-border"}`}>{row}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
