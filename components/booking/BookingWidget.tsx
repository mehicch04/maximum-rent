"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, CalendarDays, CircleCheck, MapPin, Sparkles, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CarListItem } from "@/lib/types";
import type { ExtraItem } from "@/lib/extras";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { DateField } from "@/components/ui/DateField";
import { TimeField } from "@/components/ui/TimeField";
import { useReturnAfterPickup } from "@/hooks/useReturnAfterPickup";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { BusyRange } from "@/lib/booking";
import { todayISO } from "@/lib/dates";
import type { AppLocale } from "@/i18n/routing";
import { CONTROL, LABEL, ReturnField, Select } from "./fields";
import { extraText, quote, type BookingState, type Loc } from "./state";

export function BookingWidget({
  car,
  locations,
  extras,
  busy,
  b,
  set,
}: {
  car: CarListItem;
  locations: Loc[];
  extras: ExtraItem[];
  busy: BusyRange[];
  b: BookingState;
  set: (p: Partial<BookingState>) => void;
}) {
  const t = useTranslations("Booking");
  const locale = useLocale() as AppLocale;
  const { currency } = useCurrency();
  const price = (v: number) => formatPrice(v, currency);

  useReturnAfterPickup(b.pickupDate, b.returnDate, (v) => set({ returnDate: v }));

  const { ready, start, end, valid, days, booked, returnId, total, canGo, href } = quote(car, b, busy);

  const wa = buildWhatsAppUrl({
    car: { title: car.title },
    pickupLocation: locations.find((l) => l.id === b.pickupLoc) ?? null,
    returnLocation: locations.find((l) => l.id === returnId) ?? null,
    pickupAt: valid ? start : null,
    returnAt: valid ? end : null,
    locale,
  });

  const minDate = todayISO(0);

  return (
    <div className="rounded-[24px] bg-surface p-5 shadow-[0_30px_60px_-40px_rgba(11,18,32,0.45)] ring-1 ring-border sm:p-6">
      {car.pricePerDay != null && (
        <p className="flex items-baseline gap-1.5">
          <bdi className="font-display text-[2rem] font-semibold leading-none tracking-tight text-foreground">
            {price(car.pricePerDay)}
          </bdi>
          <span className="text-sm text-muted-foreground">{t("perDay")}</span>
        </p>
      )}

      <div className="mt-5 grid gap-3">
        <div>
          <label htmlFor="bw-pickup" className={LABEL}>
            <MapPin className="h-3.5 w-3.5 text-brand-strong" />
            {t("pickupPlace")}
          </label>
          <Select id="bw-pickup" value={b.pickupLoc} onChange={(v) => set({ pickupLoc: v })}>
            <option value="" disabled>
              {t("choose")}
            </option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>

        <ReturnField
          id="bw-return"
          label={t("returnPlace")}
          diff={b.diff}
          onDiff={(v) => set({ diff: v, returnLoc: v ? b.returnLoc || b.pickupLoc : "" })}
          value={b.returnLoc || b.pickupLoc}
          onChange={(v) => set({ returnLoc: v })}
          pickupName={locations.find((l) => l.id === b.pickupLoc)?.name}
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </ReturnField>

        {[
          { key: "pickup", label: t("pickupDate"), date: b.pickupDate, time: b.pickupTime, min: minDate },
          { key: "return", label: t("returnDate"), date: b.returnDate, time: b.returnTime, min: b.pickupDate || minDate },
        ].map((row) => (
          <div key={row.key}>
            <span className={LABEL}>
              <CalendarDays className="h-3.5 w-3.5 text-brand-strong" />
              {row.label}
            </span>
            <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-2">
              <DateField
                value={row.date}
                min={row.min}
                locale={locale}
                onChange={(v) => set(row.key === "pickup" ? { pickupDate: v } : { returnDate: v })}
                className={CONTROL}
              />
              <TimeField
                value={row.time}
                ariaLabel={`${row.label} ${t("time")}`}
                onChange={(v) => set(row.key === "pickup" ? { pickupTime: v } : { returnTime: v })}
              />
            </div>
          </div>
        ))}
      </div>

      {ready && (
        <p
          className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
            !valid || booked
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {!valid || booked ? <TriangleAlert className="h-4 w-4 shrink-0" /> : <CircleCheck className="h-4 w-4 shrink-0" />}
          {!valid ? t("invalid") : booked ? t("booked") : t("free")}
        </p>
      )}

      {valid && car.pricePerDay != null && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-muted-foreground">
            <span>{t("rentalLine", { days, price: price(car.pricePerDay) })}</span>
            <bdi className="font-medium tabular-nums text-foreground">{price(total)}</bdi>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <span className="font-semibold text-foreground">{t("total")}</span>
            <bdi className="font-display text-2xl font-semibold tabular-nums text-foreground">{price(total)}</bdi>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-2">
        {canGo ? (
          <Link
            href={href}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t("continue")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span
            aria-disabled
            className="inline-flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-brand/40 px-6 text-sm font-semibold text-white"
          >
            {t("continue")}
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#25D366]/50 text-sm font-semibold text-[#0B6B36] transition-colors hover:bg-[#25D366]/10 dark:text-[#4ADE80]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {t("askWa")}
        </a>
      </div>

      <ul className="mt-5 space-y-2 border-t border-dashed border-border pt-4 text-[13px] text-muted-foreground">
        {car.deposit != null && (
          <li className="flex items-start gap-2">
            <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-strong" />
            {t("deposit", { amount: price(car.deposit) })}
          </li>
        )}
        <li className="flex items-start gap-2">
          <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-strong" />
          {t("noPrepay")}
        </li>
        <li className="flex items-start gap-2">
          <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-strong" />
          {t("confirmEmail")}
        </li>
      </ul>

      {extras.length > 0 && (
        <div className="mt-5 border-t border-dashed border-border pt-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-brand-strong" />
            {t("extrasTitle")}
          </p>
          <ul className="mt-3 space-y-1.5 text-[13px]">
            {extras.map((e) => (
              <li key={e.id} className="flex justify-between gap-3 text-muted-foreground">
                <span className="truncate">{extraText(e, locale).name}</span>
                <span className="shrink-0 font-medium text-foreground">
                  <bdi>{price(e.price)}</bdi> {e.pricing === "PER_DAY" ? `/ ${t("perDayUnit")}` : t("once")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
