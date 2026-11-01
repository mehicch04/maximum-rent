"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { dayStatus, type BusyRange } from "@/lib/booking";
import { monthLabel, toISODate, weekdayLabels } from "@/lib/dates";

type Props = {
  busy: BusyRange[];
  start: string;
  end: string;
  onPick: (start: string, end: string | null) => void;
  footer?: ReactNode;
};

const first = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

function Month({
  month,
  busy,
  start,
  end,
  today,
  onDay,
}: {
  month: Date;
  busy: BusyRange[];
  start: string;
  end: string;
  today: string;
  onDay: (iso: string) => void;
}) {
  const locale = useLocale();
  const y = month.getFullYear();
  const m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const count = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(y, m, i + 1))];

  return (
    <div>
      <p className="mb-3 text-center text-sm font-semibold capitalize text-foreground">{monthLabel(locale, month)}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium capitalize text-muted-foreground">
        {weekdayLabels(locale).map((w) => (
          <span key={w} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const iso = toISODate(d);
          const past = iso < today;
          const status = past ? "free" : dayStatus(busy, d);
          const edge = iso === start || iso === end;
          const inside = start && end && iso > start && iso < end;
          const tone = past
            ? "text-muted-foreground/40"
            : edge
              ? "bg-brand font-semibold text-white"
              : status === "booked"
                ? `bg-foreground/[0.06] text-muted-foreground/60 line-through ${inside ? "ring-1 ring-inset ring-brand/60" : ""}`
                : inside
                  ? "bg-brand/15 text-foreground"
                  : status === "partial"
                    ? "bg-amber-400/15 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300";
          return (
            <button
              key={iso}
              type="button"
              disabled={past || status === "booked"}
              onClick={() => onDay(iso)}
              aria-pressed={edge}
              className={`h-9 rounded-lg text-[13px] tabular-nums transition-colors disabled:cursor-not-allowed ${tone}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AvailabilityCalendar({ busy, start, end, onPick, footer }: Props) {
  const t = useTranslations("Booking");
  const [today, setToday] = useState("");
  const [view, setView] = useState<Date | null>(null);
  const [picking, setPicking] = useState<"start" | "end">("start");

  useEffect(() => {
    setToday(toISODate(new Date()));
    setView(first(start ? new Date(`${start}T12:00:00`) : new Date()));
  }, []);

  const months = useMemo(() => (view ? [view, new Date(view.getFullYear(), view.getMonth() + 1, 1)] : []), [view]);
  const atStart = !view || first(new Date()).getTime() >= view.getTime();

  const onDay = (iso: string) => {
    if (picking === "start" || !start || iso <= start) {
      onPick(iso, null);
      setPicking("end");
    } else {
      onPick(start, iso);
      setPicking("start");
    }
  };

  const shift = (n: number) => view && setView(new Date(view.getFullYear(), view.getMonth() + n, 1));

  return (
    <section className="rounded-[22px] bg-surface p-5 ring-1 ring-border sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{t("availability")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("availabilityHint")}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={atStart}
            aria-label={t("prevMonth")}
            className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-border transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label={t("nextMonth")}
            className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-border transition-colors hover:bg-surface-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {months.map((mo, i) => (
          <div key={mo.toISOString()} className={i === 1 ? "hidden sm:block" : ""}>
            <Month month={mo} busy={busy} start={start} end={end} today={today} onDay={onDay} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-500/25" />
          {t("legendFree")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-amber-400/30" />
          {t("legendPartial")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-foreground/15" />
          {t("legendBooked")}
        </span>
      </div>

      {footer && <div className="mt-5 border-t border-border pt-5">{footer}</div>}
    </section>
  );
}
