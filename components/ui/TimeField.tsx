"use client";

import { ChevronDown } from "lucide-react";

/**
 * Time picker used across the site.
 *
 * A native <input type="time"> looks different in every browser and shows
 * AM/PM on some systems, which is wrong for us. A plain select with fixed
 * half-hour slots renders identically everywhere, follows the theme, and is
 * quicker to use than typing a time.
 *
 * The chevron is drawn rather than left to the browser, because the built-in
 * one sits in a different place in each of them.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** 00:00 → 23:30 in half-hour steps. Always 24h, never AM/PM. */
export const TIME_SLOTS = Array.from(
  { length: 48 },
  (_, i) => `${pad(Math.floor(i / 2))}:${i % 2 ? "30" : "00"}`,
);

export function TimeField({
  id,
  name,
  value,
  onChange,
  ariaLabel,
  className = "",
}: {
  id?: string;
  /** Submitted with the form; the value rides along in a hidden input. */
  name?: string;
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const base =
    "h-10 w-full min-w-0 appearance-none rounded-xl border border-border bg-background pl-3 pr-9 text-base text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";

  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={`${base} ${className}`}
      >
        {TIME_SLOTS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
