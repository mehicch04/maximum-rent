"use client";

import { useCurrency } from "./CurrencyProvider";
import type { Currency } from "@/lib/currency";

const OPTIONS: Currency[] = ["BAM", "EUR"];
const LABEL: Record<Currency, string> = { BAM: "KM", EUR: "€" };

export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Valuta"
      className="inline-flex items-center rounded-lg border border-border p-0.5"
    >
      {OPTIONS.map((c) => {
        const active = currency === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            aria-pressed={active}
            className={`h-8 min-w-[2rem] rounded-md px-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-brand text-brand-foreground"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {LABEL[c]}
          </button>
        );
      })}
    </div>
  );
}
