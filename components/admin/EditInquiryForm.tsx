"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Link2, Lock, Minus, Plus } from "lucide-react";
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

/** Just enough of the linked reservation to identify it on screen. */
export type LinkedRental = {
  reference: string;
  carTitleSnapshot: string | null;
  pickupAt: string;
  returnAt: string;
};

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
  status: string;
  /** Set when the nightly job cancelled it for going unanswered. */
  expiredAt?: string | null;
  /** The other half of a vehicle swap, if this rental is part of one. */
  continuesFrom?: LinkedRental | null;
  continuedBy?: LinkedRental[];
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

function dayTime(d: Date): string {
  return new Intl.DateTimeFormat("hr-HR", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function EditInquiryForm({
  action,
  inquiry,
  cars,
  locations,
  extras = [],
  booked = [],
  occupancy = [],
  onContinue = () => {},
}: {
  action: (formData: FormData) => void;
  inquiry: EditableInquiry;
  cars: { id: string; title: string; pricePerDay: number | null }[];
  locations: { id: string; name: string }[];
  extras?: ExtraItem[];
  booked?: Booked[];
  /** Periods each vehicle is taken, so a clash can be spotted while typing. */
  occupancy?: CarBusy[];
  /** Creates the follow-on rental on another vehicle. */
  onContinue?: (fd: FormData) => void;
}) {
  const p0 = split(inquiry.pickupAt);
  const r0 = split(inquiry.returnAt);

  const [pickupDate, setPickupDate] = useState(p0.date);
  const [pickupTime, setPickupTime] = useState(p0.time);
  const [returnDate, setReturnDate] = useState(r0.date);
  const [returnTime, setReturnTime] = useState(r0.time);

  const [carId, setCarId] = useState(inquiry.carId ?? "");
  const [status, setStatus] = useState(inquiry.status);
  const [restoreReason, setRestoreReason] = useState("");

  const [chosen, setChosen] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      inquiry.extras
        .filter((e) => e.extraId)
        .map((e) => [e.extraId as string, e.qty]),
    ),
  );

  const from = new Date(`${pickupDate}T${pickupTime}`);
  const to = new Date(`${returnDate}T${returnTime}`);

  const free = useMemo(() => {
    const base = availabilityFor(extras, booked, from, to);
    for (const e of inquiry.extras) {
      if (e.extraId && base[e.extraId] !== undefined) base[e.extraId] += e.qty;
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras, booked, pickupDate, pickupTime, returnDate, returnTime]);

  const invalidPeriod = !(to.getTime() > from.getTime());

  const isRestoring = inquiry.status === "CANCELLED" && status === "CONFIRMED";

  const undoingHandover =
    inquiry.status === "IN_PROGRESS" &&
    (status === "CONFIRMED" || status === "CONTACTED" || status === "NEW");

  const busy = useMemo(() => {
    const others = occupancy.filter((o) => o.inquiryId !== inquiry.id);
    return busyCarsFor(others, from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occupancy, pickupDate, pickupTime, returnDate, returnTime]);

  const carTaken = Boolean(carId && busy.has(carId));

  const extending =
    inquiry.status === "IN_PROGRESS" &&
    new Date(inquiry.returnAt).getTime() < to.getTime();

  /** The bookings this period now runs into, with who holds them. */
  const blockers = useMemo(() => {
    if (!carId) return [];
    return occupancy
      .filter(
        (o) =>
          o.carId === carId &&
          o.inquiryId !== inquiry.id &&
          o.from < to &&
          o.to > from,
      )
      .sort((a, b) => a.from.getTime() - b.from.getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occupancy, carId, pickupDate, pickupTime, returnDate, returnTime]);

  const continuationCars = useMemo(() => {
    if (!extending) return [];
    const start = new Date(inquiry.returnAt);
    const takenThen = busyCarsFor(
      occupancy.filter((o) => o.inquiryId !== inquiry.id),
      start,
      to,
    );
    return cars.filter((c) => c.id !== carId && !takenThen.has(c.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extending, occupancy, cars, carId, returnDate, returnTime]);

  const maxUntil = blockers.length > 0 ? blockers[0].from : null;

  const [contCar, setContCar] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const swapOptions = useMemo(() => {
    const first = blockers[0];
    if (!first) return [];
    const takenThen = busyCarsFor(
      occupancy.filter((o) => o.inquiryId !== first.inquiryId),
      first.from,
      first.to,
    );
    return cars.filter((c) => c.id !== carId && !takenThen.has(c.id));
  }, [blockers, occupancy, cars, carId]);
  const freeCars = useMemo(
    () => cars.filter((c) => !busy.has(c.id)),
    [cars, busy],
  );

  /** Equipment asked for that can no longer be supplied in full. */
  const shortages = extras
    .map((e) => {
      const want = chosen[e.id] ?? 0;
      if (want === 0) return null;
      const cap = maxSelectable(e.maxQty, free[e.id] ?? 0);
      return want > cap ? { name: e.nameHr, want, cap } : null;
    })
    .filter(Boolean) as { name: string; want: number; cap: number }[];

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

  // ── Price, recalculated whenever the car or the equipment changes ────────
  const nDays = invalidPeriod
    ? 0
    : Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
  const car = cars.find((c) => c.id === carId);
  const rentalTotal = car?.pricePerDay != null ? car.pricePerDay * nDays : 0;
  const extrasTotal = extras
    .filter((e) => (chosen[e.id] ?? 0) > 0)
    .reduce((a, e) => {
      const q = chosen[e.id];
      if (e.pricing === "INCLUDED") return a;
      return a + (e.pricing === "PER_DAY" ? e.price * q * nDays : e.price * q);
    }, 0);
  const computed = rentalTotal + extrasTotal;

  const [priceTouched, setPriceTouched] = useState(false);
  const [price, setPrice] = useState(
    inquiry.totalPrice != null ? String(inquiry.totalPrice) : "",
  );

  useEffect(() => {
    if (!priceTouched && !invalidPeriod) setPrice(String(computed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed, invalidPeriod]);

  const blocked =
    invalidPeriod ||
    carTaken ||
    (extending && blockers.length > 0) ||
    (isRestoring && !restoreReason.trim());

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={inquiry.id} />

      {(inquiry.continuesFrom || (inquiry.continuedBy?.length ?? 0) > 0) && (
        <div className="rounded-xl border border-sky-500/50 bg-sky-500/[0.07] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            Ova rezervacija je dio zamjene vozila
          </p>

          <ul className="mt-2 space-y-1.5">
            {inquiry.continuesFrom && (
              <li className="rounded-lg bg-surface px-3 py-2 text-xs">
                <span className="text-muted-foreground">Nastavlja se na </span>
                <span className="font-mono font-medium text-foreground">
                  {inquiry.continuesFrom.reference}
                </span>
                <span className="block text-muted-foreground">
                  {inquiry.continuesFrom.carTitleSnapshot || "vozilo"} ·{" "}
                  {dayTime(new Date(inquiry.continuesFrom.pickupAt))} →{" "}
                  {dayTime(new Date(inquiry.continuesFrom.returnAt))}
                </span>
              </li>
            )}

            {inquiry.continuedBy?.map((c) => (
              <li key={c.reference} className="rounded-lg bg-surface px-3 py-2 text-xs">
                <span className="text-muted-foreground">Ima nastavak </span>
                <span className="font-mono font-medium text-foreground">
                  {c.reference}
                </span>
                <span className="block text-muted-foreground">
                  {c.carTitleSnapshot || "vozilo"} ·{" "}
                  {dayTime(new Date(c.pickupAt))} → {dayTime(new Date(c.returnAt))}
                </span>
              </li>
            ))}
          </ul>

          {(() => {
            const next = inquiry.continuedBy?.[0];
            if (!next) return null;
            const gap = new Date(next.pickupAt).getTime() - to.getTime();
            if (Math.abs(gap) < 60_000) return null;
            const hours = Math.round(Math.abs(gap) / 3_600_000);
            const span = hours < 24 ? `${hours} h` : `${Math.round(hours / 24)} dana`;
            return (
              <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs font-medium text-brand-strong">
                {gap > 0
                  ? `Gost ostaje bez vozila ${span} između ovog najma i nastavka.`
                  : `Ovaj najam se preklapa s nastavkom ${span}. Gost bi imao dva vozila istovremeno.`}{" "}
                Uskladite datume ili uredite {next.reference}.
              </p>
            );
          })()}

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Ako ovdje mijenjate datume, provjerite i tu rezervaciju.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl}>Status</label>
          <select name="status" value={status}
            onChange={(e) => setStatus(e.target.value)} className={input}>
            <option value="NEW">Novo</option>
            <option value="CONTACTED">Kontaktiran</option>
            <option value="CONFIRMED">Potvrđeno</option>
            <option value="IN_PROGRESS">U toku (vozilo kod klijenta)</option>
            <option value="CANCELLED">Otkazano</option>
            <option value="COMPLETED">Završeno</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Vozilo</label>
          <select name="carId" value={carId}
            onChange={(e) => setCarId(e.target.value)}
            className={`${input} ${carTaken ? "border-brand" : ""}`}>
            <option value="">— bez vozila (opći upit)</option>
            {cars.map((c) => {
              const why = busy.get(c.id);
              return (
                <option key={c.id} value={c.id}>
                  {c.title}
                  {why ? `  (Zauzeto \u2013 ${why})` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {isRestoring && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/[0.07] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            Vraćate otkazanu rezervaciju u potvrđene
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vozilo je pri otkazivanju oslobođeno, pa provjerite je li još
            slobodno za ove datume.
            {inquiry.expiredAt
              ? " Ova rezervacija je istekla bez odgovora, nije otkazana ručno."
              : ""}
          </p>
          <label className={`${lbl} mt-3`}>Razlog obnove rezervacije *</label>
          <textarea
            name="statusNote"
            required
            rows={2}
            value={restoreReason}
            onChange={(e) => setRestoreReason(e.target.value)}
            maxLength={300}
            placeholder="npr. gost se ponovo javio i potvrdio termin"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30"
          />
        </div>
      )}

      {undoingHandover && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/[0.07] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            Vraćate najam koji je već u toku
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Vozilo je izdato i vodi se kod klijenta. Ovo mijenjajte samo ako je
            izdavanje zabilježeno greškom. Vozilo ostaje zauzeto u ovom terminu
            u oba slučaja.
          </p>
        </div>
      )}

      {extending && blockers.length > 0 && (
        <div className="rounded-xl border border-brand/50 bg-brand/[0.06] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Termin je zauzet
          </p>

          {/* The one line that answers most calls, given room of its own. */}
          {maxUntil && (
            <p className="mt-2 text-base font-semibold leading-snug text-foreground">
              Možete produžiti najviše do {dayTime(maxUntil)}.
            </p>
          )}

          <p className="mt-1.5 text-xs text-muted-foreground">
            Tada vozilo preuzima{" "}
            <span className="font-medium text-foreground">
              {blockers[0]?.guest || "druga rezervacija"}
            </span>
            {blockers[0]?.reference ? ` (${blockers[0].reference})` : ""}.
          </p>

          {/* Most calls end here: set it to the latest possible date and save. */}
          {maxUntil && (
            <button
              type="button"
              onClick={() => {
                const p = (n: number) => String(n).padStart(2, "0");
                setReturnDate(
                  `${maxUntil.getFullYear()}-${p(maxUntil.getMonth() + 1)}-${p(maxUntil.getDate())}`,
                );
                setReturnTime(`${p(maxUntil.getHours())}:${p(maxUntil.getMinutes())}`);
              }}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
            >
              Postavi na {dayTime(maxUntil)}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            className="mt-3 text-xs font-medium text-brand-strong underline underline-offset-2"
          >
            {showOptions ? "Sakrij mogućnosti" : "Ako gost traži duže…"}
          </button>

          <div className={showOptions ? "block" : "hidden"}>

          <ul className="mt-3 space-y-1.5">
            {blockers.map((b, i) => (
              <li
                key={`${b.inquiryId ?? b.label}-${i}`}
                className="rounded-lg bg-surface px-3 py-2 text-xs"
              >
                <span className="font-medium text-foreground">
                  {b.guest || b.label}
                </span>
                {b.reference && (
                  <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                    {b.reference}
                  </span>
                )}
                <span className="block text-muted-foreground">
                  preuzima {dayTime(b.from)} · vraća {dayTime(b.to)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Vozilo je kod trenutnog gosta, pa se njemu ne može zamijeniti.
            Da biste produžili, prebacite gornju rezervaciju na drugo vozilo
            preko dugmeta Uredi na njoj.
          </p>

          <div className="mt-3 rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-semibold text-foreground">
              1. Nastavite najam na drugom vozilu
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gost vraća trenutno vozilo kako je dogovoreno i odmah preuzima
              drugo. Nova rezervacija se pravi s njegovim podacima, za period
              od {dayTime(new Date(inquiry.returnAt))} do {dayTime(to)}.
            </p>

            {continuationCars.length === 0 ? (
              <p className="mt-2 text-xs font-medium text-brand-strong">
                Nijedno vozilo nije slobodno u tom periodu.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                <select
                  value={contCar}
                  onChange={(e) => setContCar(e.target.value)}
                  className={input}
                >
                  <option value="">
                    Odaberite vozilo ({continuationCars.length} slobodno)…
                  </option>
                  {continuationCars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                      {c.pricePerDay != null ? ` · ${c.pricePerDay} KM/dan` : ""}
                    </option>
                  ))}
                </select>

                {(() => {
                  const start = new Date(inquiry.returnAt);
                  const freeThen = availabilityFor(
                    extras,
                    booked.filter((b) => b.extraId),
                    start,
                    to,
                  );
                  const short = inquiry.extras
                    .filter((e) => e.extraId)
                    .map((e) => {
                      const item = extras.find((x) => x.id === e.extraId);
                      if (!item) return null;
                      const cap = maxSelectable(item.maxQty, freeThen[item.id] ?? 0);
                      return cap < e.qty ? item.nameHr : null;
                    })
                    .filter(Boolean) as string[];
                  if (short.length === 0) return null;
                  return (
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      Za produženi period nema: {short.join(", ")}. Nastavak će
                      biti napravljen bez toga.
                    </p>
                  );
                })()}

                <button
                  type="button"
                  disabled={!contCar}
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("sourceId", inquiry.id);
                    fd.set("carId", contCar);
                    fd.set("until", to.toISOString());
                    onContinue(fd);
                  }}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-50"
                >
                  Napravi nastavak najma
                </button>
                <p className="text-xs text-muted-foreground">
                  Trenutna rezervacija ostaje nepromijenjena i završava kako je
                  dogovoreno.
                </p>
              </div>
            )}
          </div>

          <div className="mt-2 rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-semibold text-foreground">
              2. Ili premjestite rezervaciju koja blokira
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gost zadržava vozilo koje već ima. Otvorite rezervaciju
              {blockers[0]?.reference ? ` ${blockers[0].reference}` : ""} i
              dodijelite joj drugo vozilo.
            </p>
            <p className="mb-1 mt-2 text-xs font-medium text-foreground">
              Slobodno za termin te rezervacije:
            </p>
            {swapOptions.length === 0 ? (
              <p className="text-xs font-medium text-brand-strong">
                Nijedno vozilo nije slobodno u tom terminu. Produžetak nije
                moguć bez dogovora s tim gostom.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {swapOptions.slice(0, 8).map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground"
                  >
                    {c.title}
                    {c.pricePerDay != null && (
                      <span className="ml-1 text-muted-foreground">
                        {c.pricePerDay} KM
                      </span>
                    )}
                  </li>
                ))}
                {swapOptions.length > 8 && (
                  <li className="px-1 py-1 text-xs text-muted-foreground">
                    +{swapOptions.length - 8} još
                  </li>
                )}
              </ul>
            )}
          </div>

          </div>
        </div>
      )}

      {/* Vehicle clash: say it plainly and offer what can be given instead. */}
      {carTaken && !extending && (
        <div className="rounded-xl border border-brand/50 bg-brand/[0.06] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Vozilo je zauzeto u ovom terminu ({busy.get(carId)})
          </p>
          <label className={`${lbl} mt-3`}>Odaberite zamjensko vozilo</label>
          {freeCars.length === 0 ? (
            <p className="text-xs font-medium text-brand-strong">
              Nijedno vozilo nije slobodno u tom periodu. Promijenite datume.
            </p>
          ) : (
            <select value="" onChange={(e) => e.target.value && setCarId(e.target.value)}
              className={input}>
              <option value="">Slobodno {freeCars.length} vozila…</option>
              {freeCars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                  {c.pricePerDay != null ? ` · ${c.pricePerDay} KM/dan` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Equipment that had to be trimmed; the amounts are already reduced. */}
      {shortages.length > 0 && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/[0.07] p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Oprema je smanjena na dostupnu količinu
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {shortages.map((s) => (
              <li key={s.name}>
                {s.name}: traženo {s.want}, slobodno {s.cap}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className={lbl}>Preuzimanje</label>
          <div className="flex gap-2">
            <DateField
              name="pickupDate"
              value={pickupDate}
              locale="hr"
              placeholder="Odaberite…"
              onChange={(v) => {
                setPickupDate(v);
                // Keep the return from falling behind the pickup.
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
          <label className={lbl}>Vraćanje</label>
          <div className="flex gap-2">
            <DateField
              name="returnDate"
              value={returnDate}
              min={pickupDate || undefined}
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

      <div className="rounded-xl border border-border bg-surface-muted/50 p-4">
        <label className={lbl}>Ukupna cijena (KM)</label>
        <input
          name="totalPrice"
          inputMode="decimal"
          value={price}
          onChange={(e) => {
            setPriceTouched(true);
            setPrice(e.target.value);
          }}
          className={input}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {priceTouched
            ? `Izračunato po trenutnom izboru: ${computed} KM.`
            : "Prati vozilo i opremu. Upišite svoj iznos ako ste dogovorili popust."}
        </p>
      </div>

      <button
        type="submit"
        disabled={blocked}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {extending && blockers.length > 0
          ? "Termin je zauzet"
          : carTaken
          ? "Odaberite slobodno vozilo"
          : isRestoring && !restoreReason.trim()
            ? "Upišite razlog obnove"
            : "Sačuvaj izmjene"}
      </button>
    </form>
  );
}
