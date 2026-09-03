"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Wrench, Phone, AlertTriangle, User, Lock, Minus } from "lucide-react";
import { DateField } from "@/components/ui/DateField";
import type { ExtraItem } from "@/lib/extras";
import {
  availabilityFor,
  maxSelectable,
  type Booked,
} from "@/lib/extras-availability";

const input =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

/**
 * Reasons a car leaves the fleet for a while.
 *
 * The choice is not cosmetic: it decides where the car shows up in the fleet
 * chart, and a manual booking additionally carries a price so a deal agreed
 * over the phone counts towards revenue like any other.
 */
const KINDS = [
  {
    value: "MAINTENANCE",
    label: "Servis / Održavanje",
    icon: Wrench,
    note: "Vozilo se vodi kao na servisu.",
  },
  {
    value: "MANUAL_BOOKING",
    label: "Manuelna rezervacija (telefon / uživo)",
    icon: Phone,
    note: "Vozilo se vodi kao u najmu, a iznos ulazi u prihod.",
  },
  {
    value: "DAMAGE",
    label: "Oštećenje / Sudar",
    icon: AlertTriangle,
    note: "Vozilo se vodi kao na servisu.",
  },
  {
    value: "PRIVATE",
    label: "Privatna upotreba",
    icon: User,
    note: "Vozilo se samo skida sa stanja, bez prihoda.",
  },
] as const;

type Kind = (typeof KINDS)[number]["value"];

export function BlockForm({
  action,
  cars,
  today,
  extras = [],
  booked = [],
}: {
  action: (formData: FormData) => void;
  cars: { id: string; title: string }[];
  today: string;
  extras?: ExtraItem[];
  /**
   * Everything already promised, from the website and from earlier manual
   * bookings. Checking both is the whole point: a clerk filling this form must
   * not be able to hand out a seat the website already gave away.
   */
  booked?: Booked[];
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState<Kind>("MAINTENANCE");
  const [chosen, setChosen] = useState<Record<string, number>>({});

  // Blocks run from the start of the first day to the end of the last, which is
  // how the server stores them, so availability lines up exactly.
  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59`) : null;

  const free = useMemo(
    () => availabilityFor(extras, booked, fromDate, toDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extras, booked, from, to],
  );

  // Changing the dates can shrink what is available, so an earlier choice is
  // trimmed rather than silently sending a quantity that cannot be honoured.
  useEffect(() => {
    let changed = false;
    const next: Record<string, number> = {};
    for (const [id, qty] of Object.entries(chosen)) {
      const item = extras.find((e) => e.id === id);
      if (!item) continue;
      const capped = Math.min(qty, maxSelectable(item.maxQty, free[id] ?? 0));
      if (capped !== qty) changed = true;
      if (capped > 0) next[id] = capped;
    }
    if (changed) setChosen(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [free]);

  const selected = KINDS.find((k) => k.value === kind)!;
  const Icon = selected.icon;

  const isBooking = kind === "MANUAL_BOOKING";
  const isDamage = kind === "DAMAGE";
  // Only these two need anything beyond the basics; the row stays a single
  // line until it actually has to grow.
  const hasExtraFields = isBooking || isDamage;

  return (
    <form
      action={action}
      className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr_auto]">
        <div className="min-w-0">
          <label className={lbl}>Vozilo</label>
          <select name="carId" required className={input} defaultValue="">
            <option value="" disabled>
              Odaberite vozilo…
            </option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

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

      {/* What the choice actually does, said plainly, because it changes the
          reports and that is not obvious from the label alone. */}
      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 text-brand-strong" />
        {selected.note}
      </p>

      {hasExtraFields && (
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          {isBooking && (
            <>
              <div className="min-w-0">
                <label className={lbl}>Ime klijenta *</label>
                <input
                  type="text"
                  name="clientName"
                  required
                  maxLength={80}
                  placeholder="Ime i prezime"
                  className={input}
                />
              </div>
              <div className="min-w-0">
                <label className={lbl}>Ukupna cijena (KM) *</label>
                <input
                  type="number"
                  name="totalPrice"
                  required
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="450"
                  className={input}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Ulazi u prihod na stranici Analitika.
                </p>
              </div>

              {extras.length > 0 && (
                <div className="sm:col-span-2">
                  <label className={lbl}>Dodatna oprema</label>
                  {!from || !to ? (
                    <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                      Odaberite datume da vidite šta je slobodno.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                      {extras.map((e) => {
                        const qty = chosen[e.id] ?? 0;
                        const freePieces = free[e.id] ?? 0;
                        const cap = maxSelectable(e.maxQty, freePieces);
                        const soldOut = cap === 0;

                        return (
                          <li
                            key={e.id}
                            className={`flex items-center gap-3 px-3 py-2 ${
                              soldOut ? "bg-surface-muted/40 opacity-50" : "bg-surface"
                            }`}
                          >
                            {soldOut ? (
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground">
                                <Lock className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setChosen((c) => {
                                      const n = { ...c };
                                      if (qty <= 1) delete n[e.id];
                                      else n[e.id] = qty - 1;
                                      return n;
                                    })
                                  }
                                  disabled={qty === 0}
                                  aria-label={`Smanji ${e.nameHr}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border transition-colors hover:border-brand disabled:opacity-40"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-5 text-center text-sm font-semibold tabular-nums">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setChosen((c) => ({
                                      ...c,
                                      [e.id]: Math.min(cap, qty + 1),
                                    }))
                                  }
                                  disabled={qty >= cap}
                                  aria-label={`Povećaj ${e.nameHr}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border transition-colors hover:border-brand disabled:opacity-40"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {e.nameHr}
                              </span>
                              <span className="block text-xs">
                                {soldOut ? (
                                  <span className="font-medium text-brand-strong">
                                    Nedostupno u odabranom periodu
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Slobodno još: {freePieces} od {e.totalStock}
                                  </span>
                                )}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Selection travels as one field; the server re-checks it. */}
                  <input
                    type="hidden"
                    name="extras"
                    value={JSON.stringify(
                      Object.entries(chosen).map(([id, qty]) => ({ id, qty })),
                    )}
                  />
                </div>
              )}
            </>
          )}

          {isDamage && (
            <div className="min-w-0 sm:col-span-2">
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
        </div>
      )}
    </form>
  );
}
