"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { RANGES, type Range } from "@/lib/analytics";

/**
 * Global period filter.
 *
 * The choice lives in the URL rather than in component state, so a view can be
 * bookmarked or sent to someone, and a refresh keeps what was selected.
 */
export function RangeFilter({ value }: { value: Range }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const change = (next: string) => {
    const p = new URLSearchParams(params.toString());
    if (next === "month") p.delete("period");
    else p.set("period", next);
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="relative">
      <label htmlFor="period" className="sr-only">
        Period
      </label>
      <select
        id="period"
        value={value}
        onChange={(e) => change(e.target.value)}
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
  );
}
