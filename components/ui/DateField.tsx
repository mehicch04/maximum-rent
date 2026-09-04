"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  min?: string; // "YYYY-MM-DD"
  locale?: string; // "hr" | "en"
  placeholder?: string;
  /** When set, also renders a hidden input so native <form> submits the value. */
  name?: string;
  className?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s?: string) => (s ? new Date(`${s}T12:00:00`) : null);
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Friendly calendar picker that replaces the native <input type="date">.
 * Easier to navigate on desktop (a real month grid instead of the tiny native
 * dropdown), and works the same on touch. Month/weekday names come from Intl,
 * so it's automatically localized (HR/EN). The popover renders in a portal and
 * is positioned with fixed coordinates, so it never gets clipped inside modals
 * or scroll containers.
 */
/** True when `d` is the final day of its month. */
function isLastDayOfMonth(d: Date): boolean {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() === d.getDate();
}

export function DateField({
  value,
  onChange,
  min,
  locale = "hr",
  placeholder = "—",
  name,
  className = "",
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; up: boolean }>({
    left: 0,
    top: 0,
    up: false,
  });

  const selected = fromISO(value);
  const minDate = fromISO(min);
  /**
   * Which month the grid opens on.
   *
   * It follows the selected date, but never opens on a month where every day
   * is disabled: if the selection is earlier than `min` (typical for a return
   * date after the pickup was moved), we jump to the month of `min` so the
   * visitor doesn't have to click forward to reach a selectable day.
   */
  const startView = () => {
    let base = selected ?? minDate ?? new Date();
    if (minDate && startOfDay(base) < startOfDay(minDate)) base = minDate;

    // If the earliest selectable day is the last day of its month, that month
    // has nothing else to offer — opening it would show a grid of disabled
    // days and force the visitor to page forward. Typical case: the car is
    // picked up on the 31st, so the return almost always falls next month.
    if (minDate && isLastDayOfMonth(base) && startOfDay(base) <= startOfDay(minDate)) {
      return new Date(base.getFullYear(), base.getMonth() + 1, 1);
    }
    return base;
  };

  const [view, setView] = useState(startView);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setView(startView());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min]);

  // Re-anchor every time the popover opens, so it is right even when the
  // visitor changed the pickup date after last looking at this calendar.
  useEffect(() => {
    if (open) setView(startView());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const place = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const POP_H = 340;
    const up = r.bottom + POP_H > window.innerHeight && r.top > POP_H;
    const left = Math.min(r.left, window.innerWidth - 320 - 8);
    setPos({
      left: Math.max(8, left),
      top: up ? r.top - 8 : r.bottom + 8,
      up,
    });
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        !popRef.current?.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const reposition = () => place();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const label = selected
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(selected)
    : placeholder;

  // Monday-first weekday headers (Jan 1 2024 was a Monday).
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
      new Date(2024, 0, 1 + i),
    ),
  );
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(view);

  const y = view.getFullYear();
  const m = view.getMonth();
  const startOffset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const minD = minDate ? startOfDay(minDate) : null;
  const todayISO = toISO(new Date());

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(y, m, i + 1)),
  ];

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 ${className} ${
          selected ? "" : "text-muted-foreground"
        }`}
      >
        <span className="truncate">{label}</span>
        <Calendar className="pointer-events-none h-4 w-4 shrink-0 text-brand" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popRef}
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              transform: pos.up ? "translateY(-100%)" : "none",
            }}
            /*
             * Above every dialog in the app.
             *
             * At z-90 the calendar sat underneath the modals, which all use
             * z-95, so inside one it was drawn behind the overlay: clicks
             * landed on the overlay and it looked like the field was dead.
             * The popover is portalled to <body>, so nothing here can clip it
             * once it is on top.
             */
            className="z-[110] w-[304px] rounded-2xl border border-border bg-surface p-3 shadow-card-hover"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Prethodni mjesec"
                onClick={() => setView(new Date(y, m - 1, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground/80 transition-colors hover:border-brand hover:text-brand"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold capitalize">
                {monthLabel}
              </span>
              <button
                type="button"
                aria-label="Sljedeći mjesec"
                onClick={() => setView(new Date(y, m + 1, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground/80 transition-colors hover:border-brand hover:text-brand"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {weekdays.map((w) => (
                <div
                  key={w}
                  className="py-1 text-center text-xs font-medium capitalize text-muted-foreground"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={`b${i}`} />;
                const iso = toISO(d);
                const disabled = minD ? startOfDay(d) < minD : false;
                const isSelected = iso === value;
                const isToday = iso === todayISO;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    className={`h-9 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-brand font-semibold text-brand-foreground"
                        : disabled
                          ? "cursor-not-allowed text-muted-foreground/40"
                          : isToday
                            ? "border border-brand/40 text-brand hover:bg-brand/10"
                            : "text-foreground hover:bg-surface-muted"
                    }`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
