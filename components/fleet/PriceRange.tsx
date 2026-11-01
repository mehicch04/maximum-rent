"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export type RangeModel = {
  min: number;
  max: number;
  value: [number, number];
  amounts: number[];
  symbol: string;
  onChange: (lo: number, hi: number) => void;
};

const BINS = 18;
const THUMB = 22;

export function PriceRange({ min, max, value, amounts, symbol, onChange }: RangeModel) {
  const t = useTranslations("Fleet");
  const [draft, setDraft] = useState<[number, number]>(value);
  const [text, setText] = useState<[string, string]>([String(value[0]), String(value[1])]);
  const [lo, hi] = value;

  useEffect(() => {
    setDraft([lo, hi]);
    setText([String(lo), String(hi)]);
  }, [lo, hi]);

  const span = Math.max(1, max - min);
  const bins = useMemo(() => {
    const b = Array<number>(BINS).fill(0);
    for (const a of amounts) b[Math.min(BINS - 1, Math.max(0, Math.floor(((a - min) / span) * BINS)))]++;
    return b;
  }, [amounts, min, span]);
  const peak = Math.max(1, ...bins);
  const inRange = amounts.filter((a) => a >= draft[0] && a <= draft[1]).length;
  const pct = (v: number) => (v - min) / span;

  const commit = (a: number, b: number) => {
    let x = Math.round(Number.isFinite(a) ? a : min);
    let y = Math.round(Number.isFinite(b) ? b : max);
    x = Math.min(Math.max(x, min), max);
    y = Math.min(Math.max(y, min), max);
    if (x > y) [x, y] = [y, x];
    setDraft([x, y]);
    setText([String(x), String(y)]);
    if (x !== lo || y !== hi) onChange(x, y);
  };

  const pos = (v: number) => `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${pct(v)})`;

  const field = (i: 0 | 1) => (
    <label className="block min-w-0 flex-1 cursor-text rounded-xl bg-surface px-3 py-2 ring-1 ring-border transition-shadow focus-within:ring-2 focus-within:ring-brand">
      <span className="block text-[11px] font-medium text-muted-foreground">{t(i === 0 ? "priceFrom" : "priceTo")}</span>
      <span className="flex items-baseline gap-1">
        <input
          inputMode="numeric"
          value={text[i]}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setText((s) => (i === 0 ? [v, s[1]] : [s[0], v]));
          }}
          onBlur={() => (i === 0 ? commit(Number(text[0] || min), draft[1]) : commit(draft[0], Number(text[1] || max)))}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full min-w-0 bg-transparent text-sm font-semibold tabular-nums text-foreground outline-none"
        />
        <span className="text-xs font-medium text-muted-foreground">{symbol}</span>
      </span>
    </label>
  );

  return (
    <div className="pt-1">
      <div aria-hidden style={{ marginInline: THUMB / 2 }} className="flex h-16 items-end gap-[3px]">
        {bins.map((n, i) => {
          const a = min + (i / BINS) * span;
          const b = min + ((i + 1) / BINS) * span;
          const on = b >= draft[0] && a <= draft[1];
          return (
            <span
              key={i}
              style={{ height: n ? `${22 + (n / peak) * 78}%` : "8%" }}
              className={`flex-1 rounded-t-[4px] transition-[height,background-color] duration-300 ${on ? (n ? "bg-brand" : "bg-brand/30") : "bg-border"}`}
            />
          );
        })}
      </div>

      <div className="relative h-7">
        <span aria-hidden style={{ insetInline: THUMB / 2 }} className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border" />
        <span
          aria-hidden
          style={{ insetInlineStart: pos(draft[0]), width: `calc((100% - ${THUMB}px) * ${pct(draft[1]) - pct(draft[0])})` }}
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={draft[0]}
          aria-label={t("priceFrom")}
          onChange={(e) => setDraft([Math.min(Number(e.target.value), draft[1]), draft[1]])}
          onPointerUp={(e) => commit(Number(e.currentTarget.value), draft[1])}
          onKeyUp={(e) => commit(Number(e.currentTarget.value), draft[1])}
          style={{ zIndex: draft[0] > max - span * 0.08 ? 4 : 2 }}
          className="dual-range absolute inset-0 h-full w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={draft[1]}
          aria-label={t("priceTo")}
          onChange={(e) => setDraft([draft[0], Math.max(Number(e.target.value), draft[0])])}
          onPointerUp={(e) => commit(draft[0], Number(e.currentTarget.value))}
          onKeyUp={(e) => commit(draft[0], Number(e.currentTarget.value))}
          style={{ zIndex: 3 }}
          className="dual-range absolute inset-0 h-full w-full"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        {field(0)}
        {field(1)}
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground" aria-live="polite">
        {t("inRange", { count: inRange })}
      </p>
    </div>
  );
}
