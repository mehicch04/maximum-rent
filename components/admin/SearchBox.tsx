"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Free-text search that keeps the current filters intact.
 *
 * Typed into the URL rather than held in component state, so a result can be
 * bookmarked or reopened, and so the existing status filter and date range
 * still apply. Debounced, because otherwise every keystroke is a round trip.
 */
export function SearchBox({
  placeholder = "Traži po imenu, telefonu ili broju…",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("q") ?? "";

  const [value, setValue] = useState(current);

  // Follows the URL when the user navigates or clears filters elsewhere.
  useEffect(() => setValue(current), [current]);

  useEffect(() => {
    if (value === current) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Pretraga"
        className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Očisti pretragu"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
