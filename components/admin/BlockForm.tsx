"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Plus, User, Wrench } from "lucide-react";
import { DateField } from "@/components/ui/DateField";
import { busyCarsFor, type CarBusy } from "@/lib/extras-availability";

const input =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

/**
 * Why a car is off the road.
 *
 * Bookings taken by phone used to live here too, which meant this form also
 * had to collect a client, a price and equipment. They now have their own
 * screen, so this one is back to what it is for: taking a car out of service.
 */
const KINDS = [
  { value: "MAINTENANCE", label: "Servis / Održavanje", icon: Wrench },
  { value: "DAMAGE", label: "Oštećenje / Sudar", icon: AlertTriangle },
  { value: "PRIVATE", label: "Privatna upotreba", icon: User },
] as const;

type Kind = (typeof KINDS)[number]["value"];

export function BlockForm({
  action,
  cars,
  today,
  occupancy = [],
}: {
  action: (formData: FormData) => void;
  cars: { id: string; title: string }[];
  today: string;
  /** Periods each vehicle is already taken, so busy ones can be greyed out. */
  occupancy?: CarBusy[];
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState<Kind>("MAINTENANCE");
  const [carId, setCarId] = useState("");

  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59`) : null;
  const datesReady = Boolean(from && to);

  const busy = useMemo(
    () => busyCarsFor(occupancy, fromDate, toDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [occupancy, from, to],
  );

  // Free vehicles first, so what can actually be blocked is not buried among
  // greyed-out entries.
  const sortedCars = useMemo(() => {
    if (!datesReady) return cars;
    return [...cars].sort((a, b) => Number(busy.has(a.id)) - Number(busy.has(b.id)));
  }, [cars, busy, datesReady]);

  // A car picked before the dates moved may now clash; clearing it beats
  // leaving a greyed-out option selected.
  useEffect(() => {
    if (carId && busy.has(carId)) setCarId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  const selected = KINDS.find((k) => k.value === kind)!;
  const Icon = selected.icon;
  const isDamage = kind === "DAMAGE";

  return (
    <form
      action={action}
      className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_2fr_auto]">
        <div className="min-w-0">
          <label className={lbl}>Od datuma</label>
          <DateField
            name="from"
            value={from}
            min={today}
            locale="hr"
            placeholder="Odaberite…"
            onChange={(v) => {
              setFrom(v);
              if (to && to < v) setTo(v);
            }}
            className={input}
          />
        </div>

        <div className="min-w-0">
          <label className={lbl}>Do datuma</label>
          <DateField
            name="to"
            value={to}
            min={from || today}
            locale="hr"
            placeholder="Odaberite…"
            onChange={setTo}
            className={input}
          />
        </div>

        <div className="min-w-0">
          <label className={lbl}>Vozilo</label>
          <select
            name="carId"
            required
            disabled={!datesReady}
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
            className={`${input} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <option value="" disabled>
              {datesReady ? "Odaberite vozilo…" : "Prvo odaberite datume"}
            </option>
            {sortedCars.map((c) => {
              const why = busy.get(c.id);
              return (
                <option key={c.id} value={c.id} disabled={!!why}>
                  {c.title}
                  {why ? `  (Zauzeto \u2013 ${why})` : ""}
                </option>
              );
            })}
          </select>
          {datesReady && (
            <p className="mt-1 text-xs text-muted-foreground">
              Slobodno {cars.length - busy.size} od {cars.length} vozila za taj
              period.
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label className={lbl}>Razlog</label>
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className={input}
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-1.5 self-end rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Blokiraj
        </button>
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-brand-strong" />
        Vozilo se vodi kao nedostupno i ne nudi se gostima u tom periodu.
      </p>

      {/* Kept because it is part of the reason, not operational data: it shows
          up as the note beside the vehicle in the fleet status list. */}
      {isDamage && (
        <div className="mt-4 border-t border-border pt-4">
          <label className={lbl}>Opis štete</label>
          <input
            type="text"
            name="reason"
            maxLength={200}
            placeholder="npr. oštećen prednji branik, čeka lakiranje"
            className={input}
          />
        </div>
      )}
    </form>
  );
}
