"use client";

import { useEffect, useState } from "react";
import { FileDown, FileText, Fuel, Gauge, IdCard, Loader2 } from "lucide-react";
import { DateField } from "@/components/ui/DateField";
import { TimeField } from "@/components/ui/TimeField";
import { FUEL_LEVELS, type FuelLevel, type HandoverItem } from "./types";
import type { ContractCompany, ContractData } from "./contract-data";
import { generateContractPdf } from "./generate-pdf";
import { generateContractDocx } from "./generate-docx";

const input =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";
const section = "text-xs font-semibold uppercase tracking-wide text-brand-strong";

/** Details that only exist at the desk, filled in while the guest is standing there. */
type Handover = {
  licence: string;
  document: string;
  address: string;
  mileage: string;
  fuel: FuelLevel;
  condition: string;
};

const EMPTY: Handover = {
  licence: "",
  document: "",
  address: "",
  mileage: "",
  fuel: "Puno",
  condition: "",
};

/** ISO timestamp into the date and time halves the pickers expect. */
function split(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

/** 2026-09-12 -> 12.09.2026. */
const fmtDate = (d: string) => {
  const [y, m, day] = d.split("-");
  return y && m && day ? `${day}.${m}.${y}.` : d;
};

const dt = (iso: string) =>
  new Intl.DateTimeFormat("hr-HR", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

/**
 * The contract, pre-filled from the reservation and editable before printing.
 *
 * Everything the system already knows is filled in but left open: a guest may
 * arrive an hour late or swap a car at the desk, and a contract that cannot be
 * corrected on the spot gets rewritten by hand anyway.
 */
export function ContractEditor({
  item,
  company,
}: {
  item: HandoverItem;
  company?: ContractCompany;
}) {
  const [guest, setGuest] = useState(item.guest);
  const [phone, setPhone] = useState(item.phone);
  const [email, setEmail] = useState(item.email);
  const [carTitle, setCarTitle] = useState(item.carTitle);
  const [plate, setPlate] = useState(item.plate);
  // Split into date and time so the same pickers as the rest of the panel can
  // be used; a native datetime field renders differently in every browser.
  const [pickupDate, setPickupDate] = useState(() => split(item.pickupAt).date);
  const [pickupTime, setPickupTime] = useState(() => split(item.pickupAt).time);
  const [returnDate, setReturnDate] = useState(() => split(item.returnAt).date);
  const [returnTime, setReturnTime] = useState(() => split(item.returnAt).time);
  const [price, setPrice] = useState(
    item.totalPrice != null ? String(item.totalPrice) : "",
  );
  const [h, setH] = useState<Handover>(EMPTY);

  // Switching to another reservation must not carry the previous guest's
  // licence number into the new contract.
  useEffect(() => {
    setGuest(item.guest);
    setPhone(item.phone);
    setEmail(item.email);
    setCarTitle(item.carTitle);
    setPlate(item.plate);
    setPickupDate(split(item.pickupAt).date);
    setPickupTime(split(item.pickupAt).time);
    setReturnDate(split(item.returnAt).date);
    setReturnTime(split(item.returnAt).time);
    setPrice(item.totalPrice != null ? String(item.totalPrice) : "");
    setH(EMPTY);
  }, [item]);

  const set = (k: keyof Handover, v: string) =>
    setH((prev) => ({ ...prev, [k]: v }) as Handover);

  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);
  const [error, setError] = useState("");

  const payload = (): ContractData => ({
    company,
    reference: item.reference,
    guest,
    phone,
    email,
    carTitle,
    plate,
    // Printed the way people read dates here, not in the form's raw format.
    pickupAt: `${fmtDate(pickupDate)} u ${pickupTime}`,
    returnAt: `${fmtDate(returnDate)} u ${returnTime}`,
    pickupLocation: item.pickupLocation,
    returnLocation: item.returnLocation,
    rentalDays: item.rentalDays,
    extras: item.extras,
    totalPrice: price,
    ...h,
  });

  /** Runs a generator and reports rather than failing silently. */
  const run = async (kind: "pdf" | "docx") => {
    setBusy(kind);
    setError("");
    try {
      if (kind === "pdf") await generateContractPdf(payload());
      else await generateContractDocx(payload());
    } catch (err) {
      console.error("[ugovor] generisanje nije uspjelo:", err);
      setError("Dokument nije generisan. Pokušajte ponovo.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {item.active && (
        <p className="rounded-xl border border-border bg-surface-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Vozilo je već izdato ovom gostu. Ovo je ponovna štampa; izmjene ovdje
          ne mijenjaju samu rezervaciju.
        </p>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <div>
          <p className="font-display text-lg font-bold text-foreground">
            Ugovor {item.reference}
          </p>
          <p className="text-xs text-muted-foreground">
            {dt(item.pickupAt)} → {dt(item.returnAt)}
          </p>
        </div>
        <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {item.rentalDays} {item.rentalDays === 1 ? "dan" : "dana"}
        </span>
      </div>

      {/* ── Reservation, editable ── */}
      <div>
        <p className={`${section} mb-2`}>Podaci iz rezervacije</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={lbl}>Klijent</label>
            <input value={guest} onChange={(e) => setGuest(e.target.value)} className={input} />
          </div>
          <div>
            <label className={lbl}>Telefon</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>
          <div>
            <label className={lbl}>Vozilo</label>
            <input value={carTitle} onChange={(e) => setCarTitle(e.target.value)} className={input} />
          </div>
          <div>
            <label className={lbl}>Registarska oznaka</label>
            <input value={plate} onChange={(e) => setPlate(e.target.value)}
              placeholder="J45-M-987" className={input} />
          </div>
          <div>
            <label className={lbl}>Ukupna cijena (KM)</label>
            <input value={price} inputMode="decimal"
              onChange={(e) => setPrice(e.target.value)} className={input} />
          </div>
          <div className="min-w-0">
            <label className={lbl}>Preuzimanje</label>
            <div className="flex gap-2">
              <DateField value={pickupDate} locale="hr" placeholder="Odaberite…"
                onChange={setPickupDate} className={`${input} flex-1`} />
              <div className="w-28 shrink-0">
                <TimeField value={pickupTime} onChange={setPickupTime}
                  ariaLabel="Vrijeme preuzimanja" />
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <label className={lbl}>Vraćanje</label>
            <div className="flex gap-2">
              <DateField value={returnDate} min={pickupDate || undefined} locale="hr"
                placeholder="Odaberite…" onChange={setReturnDate} className={`${input} flex-1`} />
              <div className="w-28 shrink-0">
                <TimeField value={returnTime} onChange={setReturnTime}
                  ariaLabel="Vrijeme vraćanja" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-muted/50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Lokacije
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              {item.pickupLocation || "—"} → {item.returnLocation || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-muted/50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Dodatna oprema
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              {item.extras.length === 0
                ? "—"
                : item.extras
                    .map((e) => `${e.name}${e.qty > 1 ? ` ×${e.qty}` : ""}`)
                    .join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filled in at the desk ── */}
      <div>
        <p className={`${section} mb-2 flex items-center gap-1.5`}>
          <IdCard className="h-3.5 w-3.5" />
          Dokumenti klijenta
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={lbl}>Broj vozačke dozvole</label>
            <input value={h.licence} onChange={(e) => set("licence", e.target.value)}
              className={input} />
          </div>
          <div>
            <label className={lbl}>Broj pasoša / lične karte</label>
            <input value={h.document} onChange={(e) => set("document", e.target.value)}
              className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Adresa klijenta</label>
            <input value={h.address} onChange={(e) => set("address", e.target.value)}
              placeholder="Ulica i broj, grad, država" className={input} />
          </div>
        </div>
      </div>

      <div>
        <p className={`${section} mb-2`}>Stanje vozila pri preuzimanju</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={`${lbl} flex items-center gap-1.5`}>
              <Gauge className="h-3.5 w-3.5" />
              Trenutna kilometraža
            </label>
            <input value={h.mileage} inputMode="numeric"
              onChange={(e) => set("mileage", e.target.value)}
              placeholder="npr. 84250" className={input} />
          </div>
          <div>
            <label className={`${lbl} flex items-center gap-1.5`}>
              <Fuel className="h-3.5 w-3.5" />
              Nivo goriva
            </label>
            <select value={h.fuel} onChange={(e) => set("fuel", e.target.value)}
              className={input}>
              {FUEL_LEVELS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className={lbl}>Zapisnik o stanju vozila</label>
          <textarea
            rows={4}
            value={h.condition}
            onChange={(e) => set("condition", e.target.value)}
            placeholder="Postojeća oštećenja, ogrebotine, stanje guma, nedostajuća oprema…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Upišite sve što već postoji na vozilu. Ovo je jedini zapis koji vas
            štiti ako gost pri vraćanju ospori neko oštećenje.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("pdf")}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          <FileDown className="h-4 w-4" />
          {busy === "pdf" ? "Pripremam…" : "Generiši PDF ugovor"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("docx")}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand-strong disabled:opacity-60"
        >
          <FileText className="h-4 w-4" />
          {busy === "docx" ? "Pripremam…" : "Generiši Word ugovor"}
        </button>

        {error && (
          <p className="w-full text-xs font-medium text-brand-strong">{error}</p>
        )}
      </div>
    </div>
  );
}
