"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ExtraItem } from "@/lib/extras";
import { extraLineTotal } from "@/lib/extras";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import type { ExtraSelection } from "./ExtrasPicker";

export function PriceBreakdown({
  pricePerDay,
  days,
  extras,
  selection,
}: {
  pricePerDay: number | null;
  days: number;
  extras: ExtraItem[];
  selection: ExtraSelection;
}) {
  const t = useTranslations("Extras");
  const locale = useLocale();
  const { currency } = useCurrency();
  const isEn = locale === "en";

  const chosen = extras
    .filter((e) => (selection[e.id] ?? 0) > 0)
    .map((e) => {
      const qty = selection[e.id];
      return {
        id: e.id,
        name: isEn ? e.nameEn : e.nameHr,
        qty,
        pricing: e.pricing,
        total: extraLineTotal(e.pricing, e.price, qty, days),
      };
    });

  // Nothing to add up.
  if (pricePerDay == null && chosen.length === 0) return null;

  const rentalTotal = pricePerDay != null ? pricePerDay * days : 0;
  const grandTotal = rentalTotal + chosen.reduce((a, c) => a + c.total, 0);

  const dayWord = days === 1 ? t("day") : t("days");

  return (
    <div className="rounded-xl border border-border bg-surface-muted/60 p-4">
      <dl className="space-y-2 text-sm">
        {pricePerDay != null && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">
              {t("rentalLine", { days, dayWord })}
            </dt>
            <dd className="shrink-0 font-medium tabular-nums text-foreground">
              {formatPrice(rentalTotal, currency)}
            </dd>
          </div>
        )}

        {chosen.map((c) => (
          <div key={c.id} className="flex items-baseline justify-between gap-4">
            <dt className="min-w-0 truncate text-muted-foreground">
              {c.name}
              {c.qty > 1 && ` × ${c.qty}`}
            </dt>
            <dd
              className={`shrink-0 font-medium tabular-nums ${
                c.pricing === "INCLUDED"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              }`}
            >
              {c.pricing === "INCLUDED"
                ? t("included")
                : formatPrice(c.total, currency)}
            </dd>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2.5">
          <dt className="font-semibold text-foreground">{t("estimate")}</dt>
          <dd className="shrink-0 font-display text-lg font-bold tabular-nums text-brand-strong">
            {formatPrice(grandTotal, currency)}
          </dd>
        </div>
      </dl>

      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
        {t("estimateNote")}
      </p>
    </div>
  );
}
