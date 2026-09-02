"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TrendPoint } from "@/lib/analytics";

/**
 * Bookings and revenue over time.
 *
 * The two are drawn differently on purpose: bookings are counts, revenue is
 * money, and they share no scale. Bars carry the counts, a line carries the
 * money. Two lines on one axis would suggest a relationship that is not there.
 *
 * Plain SVG, so no charting library enters the bundle.
 */

const W = 660;
const H = 260;
const PAD = { top: 16, right: 46, bottom: 28, left: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/**
 * Rounds an axis up to a readable maximum and returns its tick values.
 *
 * Scaling straight off the data gave ticks like 4, 7, 11, 15 and 980, 2.9k —
 * technically correct but hard to read at a glance. Rounding to familiar steps
 * makes both axes legible while still filling most of the chart height.
 */
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceScale(max: number, ticks = 5): { max: number; values: number[] } {
  if (!(max > 0)) return { max: 1, values: [1, 0] };
  const raw = max / (ticks - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = (NICE_STEPS.find((s) => raw / magnitude <= s) ?? 10) * magnitude;
  const top = step * (ticks - 1);
  return {
    max: top,
    values: Array.from({ length: ticks }, (_, i) => top - step * i),
  };
}

const money = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const reduce = useReducedMotion();
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nema podataka za odabrani period.
      </p>
    );
  }

  // Each axis is scaled on its own: bookings are counts, revenue is money, and
  // forcing them onto a shared scale would distort both.
  const left = niceScale(Math.max(...data.map((d) => d.bookings), 1));
  const right = niceScale(Math.max(...data.map((d) => d.revenue), 1));
  const maxBookings = left.max;
  const maxRevenue = right.max;

  const step = PLOT_W / data.length;
  const barW = Math.min(step * 0.52, 34);

  const x = (i: number) => PAD.left + step * i + step / 2;
  const yBar = (v: number) => PAD.top + PLOT_H - (v / maxBookings) * PLOT_H;
  const yLine = (v: number) => PAD.top + PLOT_H - (v / maxRevenue) * PLOT_H;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yLine(d.revenue)}`)
    .join(" ");

  const active = hover != null ? data[hover] : null;

  return (
    <div>
      {/* Legend first, so the colours are explained before they are seen. */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand/35" />
          Rezervacije
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-0.5 w-4 rounded-full bg-brand" />
          Prihod (KM)
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label="Trend rezervacija i prihoda"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-rented)" stopOpacity="0.30" />
              <stop offset="100%" stopColor="var(--chart-rented)" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* Horizontal guides with the bookings scale on the left. */}
          {left.values.map((leftVal, idx) => {
            const t = idx / (left.values.length - 1);
            const y = PAD.top + PLOT_H * t;
            return (
              <g key={leftVal}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="var(--chart-grid)"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-muted-foreground"
                  fontSize="9"
                >
                  {leftVal}
                </text>
                <text
                  x={W - PAD.right + 8}
                  y={y + 3.5}
                  className="fill-muted-foreground"
                  fontSize="9"
                >
                  {money(right.values[idx])}
                </text>
              </g>
            );
          })}

          {/* Bars: bookings. Only the height animates, which is GPU-cheap. */}
          {data.map((d, i) => {
            const y = yBar(d.bookings);
            const h = PAD.top + PLOT_H - y;
            return (
              <motion.rect
                key={`bar-${i}`}
                x={x(i) - barW / 2}
                width={barW}
                rx="4"
                fill={`url(#${gradientId})`}
                initial={reduce ? false : { y: PAD.top + PLOT_H, height: 0 }}
                whileInView={reduce ? undefined : { y, height: h }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                y={reduce ? y : undefined}
                height={reduce ? h : undefined}
                opacity={hover == null || hover === i ? 1 : 0.45}
              />
            );
          })}

          {/* Line: revenue. Drawn once via dash offset, then left alone. */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--chart-rented)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={reduce ? undefined : { pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />

          {data.map((d, i) => (
            <circle
              key={`dot-${i}`}
              cx={x(i)}
              cy={yLine(d.revenue)}
              r={hover === i ? 4.5 : 3}
              fill="var(--surface)"
              stroke="var(--chart-rented)"
              strokeWidth="2"
            />
          ))}

          {/* Full-height hit areas: easier to hover than a 3px dot. */}
          {data.map((d, i) => (
            <rect
              key={`hit-${i}`}
              x={PAD.left + step * i}
              y={PAD.top}
              width={step}
              height={PLOT_H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}

          {data.map((d, i) => (
            <text
              key={`lbl-${i}`}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              {d.label}
            </text>
          ))}
        </svg>

        {/* Readout instead of a floating tooltip: no layout shift, works on touch. */}
        <div className="mt-2 flex h-5 items-center justify-center gap-4 text-xs">
          {active ? (
            <>
              <span className="font-medium text-foreground">{active.label}</span>
              <span className="text-muted-foreground">
                {active.bookings} rezervacija
              </span>
              <span className="font-semibold text-brand-strong tabular-nums">
                {active.revenue.toLocaleString("hr-HR")} KM
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">
              Pređite mišem preko grafikona za detalje.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
