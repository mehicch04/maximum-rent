"use client";

import { useState } from "react";
import { CalendarDays, CircleCheck, Loader2, MapPin, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DateField } from "@/components/ui/DateField";
import { TimeField } from "@/components/ui/TimeField";
import { useReturnAfterPickup } from "@/hooks/useReturnAfterPickup";
import { rentalDays } from "@/lib/extras";
import { joinLocal, overlapsBusy, splitLocal, type BookingQuery, type BusyRange } from "@/lib/booking";
import { todayISO } from "@/lib/dates";
import { CONTROL, LABEL, ReturnField, Select } from "./fields";
import { Amount } from "./ui";

type Loc = { id: string; name: string; slug: string };

export function DateEditor({
  pickupAt,
  returnAt,
  pickupId,
  returnId,
  locations,
  busy,
  daily,
  pending,
  onApply,
  onCancel,
}: {
  pickupAt: string;
  returnAt: string;
  pickupId?: string;
  returnId?: string;
  locations: Loc[];
  busy: BusyRange[];
  daily: number;
  pending: boolean;
  onApply: (q: BookingQuery) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const a = splitLocal(pickupAt);
  const r = splitLocal(returnAt);
  const [pickupLoc, setPickupLoc] = useState(pickupId ?? locations[0]?.id ?? "");
  const [diff, setDiff] = useState(Boolean(returnId && returnId !== pickupId));
  const [returnLoc, setReturnLoc] = useState(returnId && returnId !== pickupId ? returnId : "");
  const [pd, setPd] = useState(a?.date ?? todayISO(1));
  const [pt, setPt] = useState(a?.time ?? "10:00");
  const [rd, setRd] = useState(r?.date ?? todayISO(4));
  const [rt, setRt] = useState(r?.time ?? "10:00");

  useReturnAfterPickup(pd, rd, setRd);

  const start = joinLocal(pd, pt);
  const end = joinLocal(rd, rt);
  const valid = end.getTime() > start.getTime();
  const booked = valid && overlapsBusy(busy, start, end);
  const days = valid ? rentalDays(start, end) : 0;
  const retId = diff ? returnLoc : pickupLoc;
  const ok = valid && !booked && Boolean(pickupLoc && retId);

  const options = locations.map((l) => (
    <option key={l.id} value={l.id}>
      {l.name}
    </option>
  ));

  return (
    <div className="mt-4 rounded-2xl bg-surface-muted p-4">
      <p className="text-sm font-semibold text-foreground">{t("editTitle")}</p>

      <div className="mt-3 grid gap-3">
        <div>
          <label htmlFor="de-pickup" className={LABEL}>
            <MapPin className="h-3.5 w-3.5 text-brand-strong" />
            {t("pickupPlace")}
          </label>
          <Select id="de-pickup" value={pickupLoc} onChange={setPickupLoc}>
            {options}
          </Select>
        </div>

        <ReturnField
          id="de-return"
          label={t("returnPlace")}
          diff={diff}
          onDiff={(v) => {
            setDiff(v);
            if (v && !returnLoc) setReturnLoc(pickupLoc);
          }}
          value={returnLoc || pickupLoc}
          onChange={setReturnLoc}
          pickupName={locations.find((l) => l.id === pickupLoc)?.name}
        >
          {options}
        </ReturnField>

        {[
          { k: "p", label: t("pickupDate"), d: pd, tm: pt, min: todayISO(0), sd: setPd, st: setPt },
          { k: "r", label: t("returnDate"), d: rd, tm: rt, min: pd, sd: setRd, st: setRt },
        ].map((row) => (
          <div key={row.k}>
            <span className={LABEL}>
              <CalendarDays className="h-3.5 w-3.5 text-brand-strong" />
              {row.label}
            </span>
            <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
              <DateField value={row.d} min={row.min} locale={locale} onChange={row.sd} className={CONTROL} />
              <TimeField value={row.tm} onChange={row.st} ariaLabel={`${row.label} ${t("time")}`} />
            </div>
          </div>
        ))}
      </div>

      <p
        className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium ${
          ok ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-600 dark:text-rose-300"
        }`}
      >
        {ok ? <CircleCheck className="h-4 w-4 shrink-0" /> : <TriangleAlert className="h-4 w-4 shrink-0" />}
        <span className="min-w-0 flex-1">{!valid ? t("invalid") : booked ? t("booked") : t("free")}</span>
        {ok && (
          <span className="shrink-0 text-foreground">
            {t("daysCount", { days })} · <Amount value={daily * days} className="font-semibold" />
          </span>
        )}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!ok || pending}
          onClick={() =>
            onApply({
              pickupLocationId: pickupLoc || undefined,
              returnLocationId: retId || undefined,
              pickupAt: start.toISOString(),
              returnAt: end.toISOString(),
            })
          }
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white transition-[background-color,opacity] hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t("updating") : t("apply")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-surface"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
