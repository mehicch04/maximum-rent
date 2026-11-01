"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, Check, CircleCheck, X } from "lucide-react";

import type { CarListItem } from "@/lib/types";
import { useRouter } from "@/i18n/navigation";
import { localParts, shortDate } from "@/lib/dates";
import { bookingHref, type BookingQuery, type BusyRange } from "@/lib/booking";
import { FUEL_LABELS, TRANSMISSION_LABELS, label as pick } from "@/lib/car-labels";
import type { AppLocale } from "@/i18n/routing";
import { DateEditor } from "./DateEditor";
import { Amount, Reveal } from "./ui";

export type SummaryLine = { key: string; label: string; amount: number };
type Loc = { id: string; name: string; slug: string } | null;

const EASE = [0.22, 1, 0.36, 1] as const;

export function CheckoutSummary({
  car,
  pickupAt,
  returnAt,
  pickup,
  ret,
  locations,
  busy,
  daily,
  days,
  rentalLabel,
  rental,
  lines,
  total,
  deposit,
}: {
  car: CarListItem;
  pickupAt: string;
  returnAt: string;
  pickup: Loc;
  ret: Loc;
  locations: { id: string; name: string; slug: string }[];
  busy: BusyRange[];
  daily: number;
  days: number;
  rentalLabel: string;
  rental: number;
  lines: SummaryLine[];
  total: number;
  deposit: number | null;
}) {
  const t = useTranslations("Booking");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [tz, setTz] = useState("Europe/Sarajevo");
  const stamp = `${pickupAt}|${returnAt}|${pickup?.id ?? ""}|${ret?.id ?? ""}`;
  const prev = useRef(stamp);

  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Sarajevo");
    } catch {}
  }, []);

  useEffect(() => {
    if (prev.current === stamp) return;
    prev.current = stamp;
    setEditing(false);
    setFlash(true);
    const id = setTimeout(() => setFlash(false), 2600);
    return () => clearTimeout(id);
  }, [stamp]);

  const apply = (q: BookingQuery) =>
    startTransition(() => router.replace(bookingHref(car.slug, q), { scroll: false }));

  const a = localParts(pickupAt, tz);
  const b = localParts(returnAt, tz);
  const stops = [
    { key: "p", label: t("pickupLine"), when: `${shortDate(locale, a.date)} · ${a.time}`, where: pickup?.name },
    { key: "r", label: t("returnLine"), when: `${shortDate(locale, b.date)} · ${b.time}`, where: ret?.name ?? pickup?.name },
  ];

  const row = "flex justify-between gap-4";

  return (
    <div className="relative rounded-[24px] bg-surface p-5 shadow-[0_30px_60px_-45px_rgba(11,18,32,0.5)] ring-1 ring-border sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("summary")}</p>

      <div className="mt-4 grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4 lg:block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted lg:aspect-[16/9]">
          {car.images?.[0] && (
            <Image src={car.images[0]} alt={car.title} fill priority sizes="(max-width: 1023px) 96px, 340px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 lg:mt-4">
          <p className="line-clamp-2 font-display text-lg font-semibold leading-snug text-foreground">{car.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[pick(TRANSMISSION_LABELS[car.transmission], locale), pick(FUEL_LABELS[car.fuelType], locale), t("daysCount", { days })].join(" · ")}
          </p>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${pending ? "opacity-50" : ""}`}>
        <ol className={`relative mt-5 space-y-4 rounded-2xl ps-6 transition-colors duration-700 ${flash ? "bg-emerald-500/[0.07]" : ""}`}>
          <span aria-hidden className="absolute bottom-3 start-[7px] top-3 w-px bg-border" />
          {stops.map((s, i) => (
            <li key={s.key} className="relative">
              <span
                aria-hidden
                className={`absolute -start-6 top-1 grid h-[15px] w-[15px] place-items-center rounded-full ${i === 0 ? "bg-brand" : "bg-foreground"}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-surface" />
              </span>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.p
                  key={s.when}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="text-sm font-semibold text-foreground first-letter:uppercase"
                >
                  {s.when}
                </motion.p>
              </AnimatePresence>
              {s.where && <p className="text-[13px] text-muted-foreground">{s.where}</p>}
            </li>
          ))}
        </ol>

        <div className="mt-3 flex min-h-[28px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            aria-expanded={editing}
            className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium text-brand-strong underline-offset-4 hover:underline"
          >
            {editing ? <X className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
            {editing ? t("cancel") : t("change")}
          </button>
          <AnimatePresence>
            {flash && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <Check className="h-3.5 w-3.5" />
                {t("updated")}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Reveal show={editing}>
          <DateEditor
            pickupAt={pickupAt}
            returnAt={returnAt}
            pickupId={pickup?.id}
            returnId={ret?.id}
            locations={locations}
            busy={busy}
            daily={daily}
            pending={pending}
            onApply={apply}
            onCancel={() => setEditing(false)}
          />
        </Reveal>

        <div className="mt-5 border-t border-border pt-4 text-sm">
          <div className={`${row} py-1 text-muted-foreground`}>
            <span className="min-w-0">{rentalLabel}</span>
            <Amount value={rental} className="font-medium text-foreground" />
          </div>
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <motion.div
                key={l.key}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="overflow-hidden"
              >
                <div className={`${row} py-1 text-muted-foreground`}>
                  <span className="min-w-0 truncate">{l.label}</span>
                  <Amount value={l.amount} className="font-medium text-foreground" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className={`${row} mt-2 items-baseline border-t border-border pt-3`}>
            <span className="font-semibold text-foreground">{t("total")}</span>
            <Amount value={total} className="font-display text-2xl font-semibold text-foreground" />
          </div>
          {deposit != null && (
            <div className={`${row} mt-1 text-muted-foreground`}>
              <span>{t("depositLabel")}</span>
              <Amount value={deposit} className="font-medium text-foreground" />
            </div>
          )}
        </div>
      </div>

      <ul className="mt-5 space-y-2 border-t border-dashed border-border pt-4 text-[13px] text-muted-foreground">
        {[t("noPrepay"), t("confirmEmail")].map((x) => (
          <li key={x} className="flex items-start gap-2">
            <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-strong" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
