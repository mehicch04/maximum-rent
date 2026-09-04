"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Lock, Minus, Plus } from "lucide-react";
import { DateField } from "@/components/ui/DateField";
import { TimeField } from "@/components/ui/TimeField";
import type { ExtraItem } from "@/lib/extras";
import {
  availabilityFor,
  busyCarsFor,
  maxSelectable,
  type Booked,
  type CarBusy,
} from "@/lib/extras-availability";

const input =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

type Car = { id: string; title: string; pricePerDay: number | null };

/** Days between two dates, rounded up, never below one. */
function days(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 1;
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

export function NewReservationForm({
  action,
  cars,
  locations,
  extras = [],
  booked = [],
  occupancy = [],
  today,
}: {
  action: (formData: FormData) => void;
  cars: Car[];
  locations: { id: string; name: string }[];
  extras?: ExtraItem[];
  booked?: Booked[];
  occupancy?: CarBusy[];
  today: string;
}) {
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");
  const [carId, setCarId] = useState("");
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [override, setOverride] = useState("");

  const datesReady = Boolean(pickupDate && returnDate);
  const from = datesReady ? new Date(`${pickupDate}T${pickupTime}`) : null;
  const to = datesReady ? new Date(`${returnDate}T${returnTime}`) : null;
  const validPeriod = !!from && !!to && to.getTime() > from.getTime();

  const busy = useMemo(
    () => busyCarsFor(occupancy, from, to),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [occupancy, pickupDate, pickupTime, returnDate, returnTime],
  );

  const free = useMemo(
    () => availabilityFor(extras, booked, from, to),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extras, booked, pickupDate, pickupTime, returnDate, returnTime],
  );

  // Free vehicles first, so what can actually be given is not buried among
  // greyed-out entries.
  const sortedCars = useMemo(() => {
    if (!datesReady) return cars;
    return [...cars].sort((a, b) => Number(busy.has(a.id)) - Number(busy.has(b.id)));
  }, [cars, busy, datesReady]);

  // Moving the dates can invalidate an earlier choice, so it is cleared or
  // trimmed rather than left to fail on save.
  useEffect(() => {
    if (carId && busy.has(carId)) setCarId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

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

  // ── Price ────────────────────────────────────────────────────────────────
  const nDays = validPeriod ? days(from!, to!) : 0;
  const car = cars.find((c) => c.id === carId);
  const rentalTotal = car?.pricePerDay != null ? car.pricePerDay * nDays : 0;

  const extraLines = extras
    .filter((e) => (chosen[e.id] ?? 0) > 0)
    .map((e) => {
      const qty = chosen[e.id];
      const total =
        e.pricing === "INCLUDED"
          ? 0
          : e.pricing === "PER_DAY"
            ? e.price * qty * nDays
            : e.price * qty;
      return { id: e.id, name: e.nameHr, qty, pricing: e.pricing, total };
    });

  const computed = rentalTotal + extraLines.reduce((a, l) => a + l.total, 0);
  const finalPrice =
    override.trim() !== "" && Number.isFinite(Number(override.replace(",", ".")))
      ? Number(override.replace(",", "."))
      : computed;

  return (
    <form action={action} className="space-y-5">
      {/* ── 1. Dates first: nothing can be checked without them ── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-strong">
          1. Period najma
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <label className={lbl}>Od datuma *</label>
            <div className="flex gap-2">
              <DateField
                name="pickupDate"
                value={pickupDate}
                min={today}
                locale="hr"
                placeholder="Odaberite…"
                onChange={(v) => {
                  setPickupDate(v);
                  if (returnDate && returnDate < v) setReturnDate(v);
                }}
                className={`${input} flex-1`}
              />
              <div className="w-28 shrink-0">
                <TimeField
                  name="pickupTime"
                  value={pickupTime}
                  onChange={setPickupTime}
                  ariaLabel="Vrijeme preuzimanja"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <label className={lbl}>Do datuma *</label>
            <div className="flex gap-2">
              <DateField
                name="returnDate"
                value={returnDate}
                min={pickupDate || today}
                locale="hr"
                placeholder="Odaberite…"
                onChange={setReturnDate}
                className={`${input} flex-1`}
              />
              <div className="w-28 shrink-0">
                <TimeField
                  name="returnTime"
                  value={returnTime}
                  onChange={setReturnTime}
                  ariaLabel="Vrijeme vraćanja"
                />
              </div>
            </div>
          </div>
        </div>
        {datesReady && !validPeriod && (
          <p className="mt-1.5 text-xs font-medium text-brand-strong">
            Vraćanje mora biti poslije preuzimanja.
          </p>
        )}
      </div>

      {/* ── 2. Vehicle and equipment, filtered by those dates ── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-strong">
          2. Vozilo i oprema
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={lbl}>Vozilo</label>
            <select name="carId" disabled={!validPeriod} value={carId}
              onChange={(e) => setCarId(e.target.value)}
              className={`${input} disabled:cursor-not-allowed disabled:opacity-60`}>
              <option value="">
                {validPeriod ? "— bez vozila —" : "Prvo odaberite datume"}
              </option>
              {sortedCars.map((c) => {
                const why = busy.get(c.id);
                return (
                  <option key={c.id} value={c.id} disabled={!!why}>
                    {c.title}
                    {c.pricePerDay != null ? ` · ${c.pricePerDay} KM/dan` : ""}
                    {why ? `  (Zauzeto \u2013 ${why})` : ""}
                  </option>
                );
              })}
            </select>
            {validPeriod && (
              <p className="mt-1 text-xs text-muted-foreground">
                Slobodno {cars.length - busy.size} od {cars.length} vozila.
              </p>
            )}
          </div>

          <div>
            <label className={lbl}>Dodatna oprema</label>
            {!validPeriod ? (
              <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                Odaberite datume da vidite šta je slobodno.
              </p>
            ) : extras.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                Nema unesene opreme.
              </p>
            ) : (
              <ul className="max-h-44 divide-y divide-border overflow-y-auto rounded-xl border border-border">
                {extras.map((e) => {
                  const qty = chosen[e.id] ?? 0;
                  const freePieces = free[e.id] ?? 0;
                  const cap = maxSelectable(e.maxQty, freePieces);
                  const soldOut = cap === 0;
                  return (
                    <li key={e.id}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 ${soldOut ? "bg-surface-muted/40 opacity-50" : "bg-surface"}`}>
                      {soldOut ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
                          <Lock className="h-3 w-3" />
                        </span>
                      ) : (
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button type="button" aria-label={`Smanji ${e.nameHr}`} disabled={qty === 0}
                            onClick={() => setChosen((c) => {
                              const n = { ...c };
                              if (qty <= 1) delete n[e.id]; else n[e.id] = qty - 1;
                              return n;
                            })}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-border transition-colors hover:border-brand disabled:opacity-40">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-xs font-semibold tabular-nums">{qty}</span>
                          <button type="button" aria-label={`Povećaj ${e.nameHr}`} disabled={qty >= cap}
                            onClick={() => setChosen((c) => ({ ...c, [e.id]: Math.min(cap, qty + 1) }))}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-border transition-colors hover:border-brand disabled:opacity-40">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-foreground">{e.nameHr}</span>
                        <span className="block text-[11px]">
                          {soldOut ? (
                            <span className="font-medium text-brand-strong">Nedostupno</span>
                          ) : (
                            <span className="text-muted-foreground">Slobodno: {freePieces}</span>
                          )}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <input type="hidden" name="extras"
              value={JSON.stringify(Object.entries(chosen).map(([id, qty]) => ({ id, qty })))} />
          </div>
        </div>
      </div>

      {/* ── 3. Guest and locations ── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-strong">
          3. Podaci klijenta
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={lbl}>Ime *</label>
            <input name="firstName" required maxLength={60} className={input} />
          </div>
          <div>
            <label className={lbl}>Prezime</label>
            <input name="lastName" maxLength={60} className={input} />
          </div>
          <div>
            <label className={lbl}>Telefon</label>
            <input name="phone" inputMode="tel" maxLength={30} className={input} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input name="email" type="email" maxLength={120} className={input} />
          </div>
          <div>
            <label className={lbl}>Lokacija preuzimanja</label>
            <select name="pickupLocationId" className={input} defaultValue="">
              <option value="">—</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Lokacija vraćanja</label>
            <select name="returnLocationId" className={input} defaultValue="">
              <option value="">—</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Napomena</label>
            <input name="message" maxLength={1000} placeholder="neobavezno" className={input} />
          </div>
        </div>
      </div>

      {/* ── 4. Price, worked out as the form is filled ── */}
      <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-strong">
          <Calculator className="h-3.5 w-3.5" />
          4. Cijena
        </p>

        {validPeriod ? (
          <dl className="space-y-1.5 text-sm">
            {car?.pricePerDay != null && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Najam · {nDays} {nDays === 1 ? "dan" : "dana"} × {car.pricePerDay} KM
                </dt>
                <dd className="font-medium tabular-nums">{rentalTotal} KM</dd>
              </div>
            )}
            {extraLines.map((l) => (
              <div key={l.id} className="flex justify-between gap-4">
                <dt className="min-w-0 truncate text-muted-foreground">
                  {l.name}{l.qty > 1 && ` × ${l.qty}`}
                  {l.pricing === "PER_DAY" && ` · ${nDays} dana`}
                </dt>
                <dd className={`font-medium tabular-nums ${l.pricing === "INCLUDED" ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                  {l.pricing === "INCLUDED" ? "Uključeno" : `${l.total} KM`}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-border pt-2">
              <dt className="font-semibold text-foreground">Izračunato</dt>
              <dd className="font-display text-base font-bold tabular-nums text-foreground">
                {computed} KM
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-xs text-muted-foreground">
            Cijena se računa čim unesete datume i odaberete vozilo.
          </p>
        )}

        <div className="mt-3 border-t border-border pt-3">
          <label className={lbl}>Konačna cijena (KM)</label>
          <input name="totalPrice" inputMode="decimal" value={override}
            onChange={(e) => setOverride(e.target.value)}
            placeholder={validPeriod ? String(computed) : "automatski"}
            className={input} />
          <p className="mt-1 text-xs text-muted-foreground">
            Ostavite prazno za izračunati iznos. Upišite svoj samo ako ste
            dogovorili popust; taj iznos ide u izvještaje.
          </p>
          {override.trim() !== "" && finalPrice !== computed && (
            <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              Razlika od izračunatog: {finalPrice - computed} KM
            </p>
          )}
        </div>
      </div>

      <button type="submit" disabled={!validPeriod}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-50">
        Sačuvaj rezervaciju
      </button>
    </form>
  );
}
