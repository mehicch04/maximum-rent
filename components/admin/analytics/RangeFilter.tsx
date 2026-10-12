"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

import { RANGES, type Range } from "@/lib/analytics";
import { DateField } from "@/components/ui/DateField";

export function RangeFilter({
  value,
  from = "",
  to = "",
}: {
  value: Range;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [start, setStart] = useState(from);
  const [end, setEnd] = useState(to);

  // Follow the URL when it changes from elsewhere, such as the back button.
  useEffect(() => {
    setStart(from);
    setEnd(to);
  }, [from, to]);

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const changePreset = (next: string) => {
    const p = new URLSearchParams(params.toString());
    if (next === "month") p.delete("period");
    else p.set("period", next);

    if (next !== "custom") {
      p.delete("from");
      p.delete("to");
    }
    push(p);
  };

  const applyCustom = () => {
    const p = new URLSearchParams(params.toString());
    p.set("period", "custom");
    p.set("from", start);
    p.set("to", end);
    push(p);
  };

  const isCustom = value === "custom";
  const validPair = Boolean(start && end && start <= end);
  const changed = start !== from || end !== to;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="relative">
        <label htmlFor="period" className="sr-only">
          Period
        </label>
        <select
          id="period"
          value={value}
          onChange={(e) => changePreset(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-ring/30 sm:w-52"
        >
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {isCustom && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-36">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Od
            </label>
            <DateField
              value={start}
              locale="hr"
              placeholder="Odaberite…"
              onChange={(v) => {
                setStart(v);
                if (end && end < v) setEnd(v);
              }}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="w-36">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Do
            </label>
            <DateField
              value={end}
              min={start || undefined}
              locale="hr"
              placeholder="Odaberite…"
              onChange={setEnd}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <button
            type="button"
            onClick={applyCustom}
            disabled={!validPair || !changed}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Primijeni
          </button>
        </div>
      )}
    </div>
  );
}
