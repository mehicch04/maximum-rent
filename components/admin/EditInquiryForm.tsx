"use client";

import { useMemo, useState } from "react";
import { Lock, Minus, Plus } from "lucide-react";
import type { ExtraItem } from "@/lib/extras";
import {
  availabilityFor,
  maxSelectable,
  type Booked,
} from "@/lib/extras-availability";

const input =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

export type EditableInquiry = {
  id: string;
  reference: string;
  carId: string | null;
  pickupAt: string;
  returnAt: string;
  pickupLocationId: string | null;
  returnLocationId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNumber: string | null;
  message: string | null;
  totalPrice: number | null;
  extras: { extraId: string | null; qty: number }[];
};

/** "2026-08-12T10:00:00Z" split into the two fields the form uses. */
function split(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

export function EditInquiryForm({
  action,
  inquiry,
  cars,
  locations,
  extras = [],
  booked = [],
}: {
  action: (formData: FormData) => void;
  inquiry: EditableInquiry;
  cars: { id: string; title: string }[];
  locations: { id: string; name: string }[];
  extras?: ExtraItem[];
  booked?: Booked[];
}) {
  const p0 = split(inquiry.pickupAt);
  const r0 = split(inquiry.returnAt);

  const [pickupDate, setPickupDate] = useState(p0.date);
  const [pickupTime, setPickupTime] = useState(p0.time);
  const [returnDate, setReturnDate] = useState(r0.date);
  const [returnTime, setReturnTime] = useState(r0.time);

  const [chosen, setChosen] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      inquiry.extras
        .filter((e) => e.extraId)
        .map((e) => [e.extraId as string, e.qty]),
    ),
  );

  const from = new Date(`${pickupDate}T${pickupTime}`);
  const to = new Date(`${returnDate}T${returnTime}`);

  /**
   * What this reservation already holds is added back before working out what
   * is free. Without that, its own two child seats would count against it and
   * the form would refuse to keep a booking exactly as it already is.
   */
  const free = useMemo(() => {
    const base = availabilityFor(extras, booked, from, to);
    for (const e of inquiry.extras) {
      if (e.extraId && base[e.extraId] !== undefined) base[e.extraId] += e.qty;
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras, booked, pickupDate, pickupTime, returnDate, returnTime]);

  const invalidPeriod = !(to.getTime() > from.getTime());

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={inquiry.id} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl}>Vozilo</label>
          <select name="carId" defaultValue={inquiry.carId ?? ""} className={input}>
            <option value="">— bez vozila (opći upit)</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Ukupna cijena (KM)</label>
          <input
            name="totalPrice"
            inputMode="decimal"
            defaultValue={inquiry.totalPrice ?? ""}
            placeholder="ostavite prazno za automatski izračun"
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <label className={lbl}>Preuzimanje</label>
          <input type="date" name="pickupDate" value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)} className={input} />
        </div>
        <div className="sm:col-span-1">
          <label className={lbl}>Vrijeme</label>
          <input type="time" name="pickupTime" value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)} className={input} />
        </div>
        <div className="sm:col-span-1">
          <label className={lbl}>Vraćanje</label>
          <input type="date" name="returnDate" value={returnDate} min={pickupDate}
            onChange={(e) => setReturnDate(e.target.value)} className={input} />
        </div>
        <div className="sm:col-span-1">
          <label className={lbl}>Vrijeme</label>
          <input type="time" name="returnTime" value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)} className={input} />
        </div>
      </div>

      {invalidPeriod && (
        <p className="text-xs font-medium text-brand-strong">
          Vraćanje mora biti poslije preuzimanja.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl}>Lokacija preuzimanja</label>
          <select name="pickupLocationId" defaultValue={inquiry.pickupLocationId ?? ""} className={input}>
            <option value="">—</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Lokacija vraćanja</label>
          <select name="returnLocationId" defaultValue={inquiry.returnLocationId ?? ""} className={input}>
            <option value="">—</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl}>Ime</label>
          <input name="firstName" defaultValue={inquiry.firstName} className={input} />
        </div>
        <div>
          <label className={lbl}>Prezime</label>
          <input name="lastName" defaultValue={inquiry.lastName} className={input} />
        </div>
        <div>
          <label className={lbl}>Email</label>
          <input name="email" type="email" defaultValue={inquiry.email} className={input} />
        </div>
        <div>
          <label className={lbl}>Telefon</label>
          <input name="phone" defaultValue={inquiry.phone} className={input} />
        </div>
        <div>
          <label className={lbl}>Broj leta</label>
          <input name="flightNumber" defaultValue={inquiry.flightNumber ?? ""} className={input} />
        </div>
        <div>
          <label className={lbl}>Napomena</label>
          <input name="message" defaultValue={inquiry.message ?? ""} maxLength={1000} className={input} />
        </div>
      </div>

      {extras.length > 0 && (
        <div>
          <label className={lbl}>Dodatna oprema</label>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {extras.map((e) => {
              const qty = chosen[e.id] ?? 0;
              const freePieces = free[e.id] ?? 0;
              const cap = maxSelectable(e.maxQty, freePieces);
              const soldOut = cap === 0 && qty === 0;

              return (
                <li key={e.id}
                  className={`flex items-center gap-3 px-3 py-2 ${soldOut ? "bg-surface-muted/40 opacity-50" : "bg-surface"}`}>
                  {soldOut ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" aria-label={`Smanji ${e.nameHr}`} disabled={qty === 0}
                        onClick={() => setChosen((c) => {
                          const n = { ...c };
                          if (qty <= 1) delete n[e.id]; else n[e.id] = qty - 1;
                          return n;
                        })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border transition-colors hover:border-brand disabled:opacity-40">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <button type="button" aria-label={`Povećaj ${e.nameHr}`} disabled={qty >= cap}
                        onClick={() => setChosen((c) => ({ ...c, [e.id]: Math.min(cap, qty + 1) }))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border transition-colors hover:border-brand disabled:opacity-40">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{e.nameHr}</span>
                    <span className="block text-xs">
                      {soldOut ? (
                        <span className="font-medium text-brand-strong">Nedostupno u odabranom periodu</span>
                      ) : (
                        <span className="text-muted-foreground">Slobodno: {freePieces} od {e.totalStock}</span>
                      )}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <input type="hidden" name="extras"
            value={JSON.stringify(Object.entries(chosen).map(([id, qty]) => ({ id, qty })))} />
        </div>
      )}

      <button
        type="submit"
        disabled={invalidPeriod}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        Sačuvaj izmjene
      </button>
    </form>
  );
}
