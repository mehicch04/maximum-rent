"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FleetSlice } from "@/lib/analytics";

/**
 * Current fleet status.
 *
 * A donut suits three parts of one whole: the eye reads the split at a glance
 * and the middle carries the fleet size, which is the number the owner asks
 * for first. Exact counts sit in the legend, because arcs are poor at precision.
 */

const SIZE = 200;
const R = 78;
const STROKE = 26;
const C = 2 * Math.PI * R;

export function FleetDonut({ data }: { data: FleetSlice[] }) {
  const reduce = useReducedMotion();
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
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-40 w-40"
          role="img"
          aria-label="Status flote"
        >
          {/* Rotated so the first slice starts at the top. */}
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
              const dash = `${len} ${C - len}`;
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
                  strokeDasharray={dash}
                  strokeDashoffset={start}
                  strokeLinecap="butt"
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={reduce ? undefined : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
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

      <ul className="w-full space-y-2.5">
        {data.map((d) => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <li key={d.key} className="flex items-center gap-3">
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
