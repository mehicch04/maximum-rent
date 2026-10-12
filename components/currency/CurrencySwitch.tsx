"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useCurrency } from "./CurrencyProvider";
import type { Currency } from "@/lib/currency";

const OPTIONS: { value: Currency; symbol: string; name: string }[] = [
  { value: "BAM", symbol: "KM", name: "Marka" },
  { value: "EUR", symbol: "€", name: "Euro" },
];

export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.value === currency) ?? OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Valuta: ${current.symbol}`}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        {current.symbol}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-card"
        >
          {OPTIONS.map((o) => {
            const active = o.value === currency;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setCurrency(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-brand/10 text-brand-strong"
                    : "text-foreground hover:bg-surface-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 text-left font-semibold">{o.symbol}</span>
                  <span className={active ? "font-semibold" : "text-muted-foreground"}>
                    {o.name}
                  </span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
