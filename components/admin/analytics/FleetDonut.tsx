"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { FleetSlice } from "@/lib/analytics";

const SIZE = 200;
const R = 78;
const STROKE = 26;
const C = 2 * Math.PI * R;

export function FleetDonut({ data }: { data: FleetSlice[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<FleetSlice | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-40px" });
  const show = reduce || inView;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Escape closes the dialog, and the page behind it must not scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const total = data.reduce((a, d) => a + d.count, 0);

  if (total === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nema vozila u floti.
      </p>
    );
  }

  let offset = 0;

  return (
    <>
      <div
        ref={wrapRef}
        className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6"
      >
        <div className="relative shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-40 w-40"
            role="img"
            aria-label="Status flote"
          >
            <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke="var(--chart-grid)"
                strokeWidth={STROKE}
              />
              {data.map((d) => {
                const len = (d.count / total) * C;
                const start = -offset;
                offset += len;
                return (
                  <motion.circle
                    key={d.key}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    fill="none"
                    stroke={d.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={start}
                    className="cursor-pointer outline-none"
                    onClick={() => setOpen(d)}
                    initial={false}
                    animate={{ opacity: show ? 1 : 0 }}
                    whileHover={{ opacity: 0.82 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
                  />
                );
              })}
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground">
              {total}
            </span>
            <span className="text-[11px] text-muted-foreground">vozila</span>
          </div>
        </div>

        <ul className="w-full space-y-1">
          {data.map((d) => {
            const pct = Math.round((d.count / total) * 100);
            return (
              <li key={d.key}>
                <button
                  type="button"
                  onClick={() => setOpen(d)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="flex-1 text-sm text-foreground">{d.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {d.count}
                  </span>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {pct} %
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground sm:text-left">
        Kliknite na status da vidite koja su to vozila.
      </p>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Vozila: ${open.label}`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: open.color }}
                    />
                    {open.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {open.count} {open.count === 1 ? "vozilo" : "vozila"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Zatvori"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground outline-none transition-colors hover:border-brand hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
                {open.vehicles.map((v) => (
                  <li key={v.id} className="flex items-baseline gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {v.title}
                      </p>
                      {v.plate && (
                        <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                          {v.plate}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {v.note}
                    </span>
                  </li>
                ))}
              </ul>

              {open.vehicles.length < open.count && (
                <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  Prikazano {open.vehicles.length} od {open.count}. Puna lista
                  dolazi kad se poveže na stvarne podatke.
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
