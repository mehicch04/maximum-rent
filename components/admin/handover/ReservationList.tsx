"use client";

import { CalendarClock, Car, User } from "lucide-react";
import type { HandoverItem } from "./types";

/**
 * Upcoming handovers, ordered by pickup time.
 *
 * The time is the largest thing on each card: at the desk the question is
 * always "who is next", not "who booked what".
 */
export function ReservationList({
  items,
  selectedId,
  onSelect,
}: {
  items: HandoverItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nema potvrđenih rezervacija za preuzimanje.
        </p>
      </div>
    );
  }

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("hr-HR", {
      timeZone: "Europe/Sarajevo",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  return (
    <ul className="space-y-2">
      {items.map((r) => {
        const active = r.id === selectedId;
        const [date, time] = fmt(r.pickupAt).split(" ");

        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect(r.id)}
              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-brand bg-brand/[0.06]"
                  : r.overdue
                    ? "border-amber-500/50 bg-amber-500/[0.06] hover:border-amber-500"
                    : "border-border bg-surface hover:border-brand/50"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold tabular-nums text-brand-strong">
                  {time}
                </span>
                <span className="text-xs text-muted-foreground">{date}</span>
                {r.overdue && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    Nije preuzeto
                  </span>
                )}
              </div>

              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{r.guest}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Car className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{r.carTitle}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarClock className="h-3 w-3 shrink-0" />
                {r.rentalDays} {r.rentalDays === 1 ? "dan" : "dana"} · {r.reference}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
