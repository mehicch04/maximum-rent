"use client";

import { useEffect, useMemo } from "react";
import { Check, Lock, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ExtraItem } from "@/lib/extras";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import {
  availabilityFor,
  maxSelectable,
  type Booked,
} from "@/lib/extras-availability";

export type ExtraSelection = Record<string, number>;

export function ExtrasPicker({
  extras,
  value,
  onChange,
  pickupAt,
  returnAt,
  booked,
}: {
  extras: ExtraItem[];
  value: ExtraSelection;
  onChange: (next: ExtraSelection) => void;
  /** Selected rental period; availability is recalculated whenever it changes. */
  pickupAt: Date | null;
  returnAt: Date | null;
  booked: Booked[];
}) {
  const locale = useLocale();
  const t = useTranslations("Extras");
  const { currency } = useCurrency();
  const isEn = locale === "en";

  const free = useMemo(
    () => availabilityFor(extras, booked, pickupAt, returnAt),
    [extras, booked, pickupAt, returnAt],
  );

  useEffect(() => {
    let changed = false;
    const next: ExtraSelection = {};
    for (const [id, qty] of Object.entries(value)) {
      const item = extras.find((e) => e.id === id);
      if (!item) continue;
      const cap = maxSelectable(item.maxQty, free[id] ?? 0);
      const capped = Math.min(qty, cap);
      if (capped !== qty) changed = true;
      if (capped > 0) next[id] = capped;
    }
    if (changed) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [free]);

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

          const freePieces = free[e.id] ?? 0;
          const cap = maxSelectable(e.maxQty, freePieces);
          const soldOut = cap === 0;
          const stepper = e.maxQty > 1;

          return (
            <li
              key={e.id}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                soldOut
                  ? "bg-surface-muted/40 opacity-50"
                  : on
                    ? "bg-brand/[0.04]"
                    : "bg-surface"
              }`}
            >
              {soldOut ? (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground"
                  aria-hidden
                >
                  <Lock className="h-3.5 w-3.5" />
                </span>
              ) : stepper ? (
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
                    onClick={() => set(e.id, Math.min(cap, qty + 1))}
                    disabled={qty >= cap}
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

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                </p>
                <p className="truncate text-xs">
                  {soldOut ? (
                    <span className="font-medium text-brand-strong">
                      {t("unavailable")}
                    </span>
                  ) : (
                    <>
                      {note && (
                        <span className="text-muted-foreground">{note} · </span>
                      )}
                      <span className="text-muted-foreground">
                        {t("freeLeft", { count: freePieces })}
                      </span>
                    </>
                  )}
                </p>
              </div>

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
