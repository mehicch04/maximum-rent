"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ExtraItem } from "@/lib/extras";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";

export type ExtraSelection = Record<string, number>;

/**
 * Optional equipment picked with a booking. Deliberately plain: one row per
 * item, a tick for yes/no items and a small stepper where several make sense
 * (child seats). No totals are shown — this is an inquiry, and the agency
 * confirms the final price.
 */
export function ExtrasPicker({
  extras,
  value,
  onChange,
}: {
  extras: ExtraItem[];
  value: ExtraSelection;
  onChange: (next: ExtraSelection) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Extras");
  const { currency } = useCurrency();
  const isEn = locale === "en";

  if (extras.length === 0) return null;

  const set = (id: string, qty: number) => {
    const next = { ...value };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    onChange(next);
  };

  const priceLabel = (e: ExtraItem) => {
    if (e.pricing === "INCLUDED") return t("included");
    const p = formatPrice(e.price, currency);
    return e.pricing === "PER_DAY" ? `${p} / ${t("perDay")}` : p;
  };

  return (
    <div>
      <p className="mb-1 block text-xs font-medium text-muted-foreground">
        {t("title")}
      </p>
      <p className="mb-3 text-xs text-muted-foreground/80">{t("subtitle")}</p>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {extras.map((e) => {
          const qty = value[e.id] ?? 0;
          const on = qty > 0;
          const name = isEn ? e.nameEn : e.nameHr;
          const note = isEn ? e.noteEn : e.noteHr;
          const stepper = e.maxQty > 1;

          return (
            <li
              key={e.id}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                on ? "bg-brand/[0.04]" : "bg-surface"
              }`}
            >
              {/* Tick / stepper */}
              {stepper ? (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => set(e.id, qty - 1)}
                    disabled={qty === 0}
                    aria-label={t("decrease", { name })}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-brand disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span
                    aria-live="polite"
                    className="w-5 text-center text-sm font-semibold tabular-nums text-foreground"
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => set(e.id, Math.min(e.maxQty, qty + 1))}
                    disabled={qty >= e.maxQty}
                    aria-label={t("increase", { name })}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-brand disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => set(e.id, on ? 0 : 1)}
                  role="checkbox"
                  aria-checked={on}
                  aria-label={name}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    on
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-surface hover:border-brand"
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                </button>
              )}

              {/* Name + note */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                {note && (
                  <p className="truncate text-xs text-muted-foreground">{note}</p>
                )}
              </div>

              {/* Price */}
              <span
                className={`shrink-0 text-xs font-semibold ${
                  e.pricing === "INCLUDED"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {priceLabel(e)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
