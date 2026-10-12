"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { DateField } from "@/components/ui/DateField";

const TYPES = [
  { value: "rezervacije", label: "Rezervacije" },
  { value: "vozila", label: "Vozila" },
  { value: "poruke", label: "Poruke" },
] as const;

const STATUSES = [
  { value: "", label: "Svi statusi" },
  { value: "NEW", label: "Novo" },
  { value: "CONTACTED", label: "Kontaktiran" },
  { value: "CONFIRMED", label: "Potvrđeno" },
  { value: "CANCELLED", label: "Otkazano" },
  { value: "COMPLETED", label: "Završeno" },
] as const;

const field =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30";
const lbl = "mb-1.5 block text-xs font-medium text-muted-foreground";

/** yyyy-mm-dd for a date offset by whole months from today. */
function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}
const today = () => new Date().toISOString().slice(0, 10);

export function ExportForm() {
  const [type, setType] = useState<string>("rezervacije");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  // Vehicles are a current snapshot, so a date range would only confuse.
  const datesApply = type !== "vozila";
  const statusApplies = type === "rezervacije";

  const href = () => {
    const p = new URLSearchParams({ type });
    if (datesApply && from) p.set("from", from);
    if (datesApply && to) p.set("to", to);
    if (statusApplies && status) p.set("status", status);
    return `/api/admin/export?${p.toString()}`;
  };

  const preset = (months: number | null) => {
    if (months === null) {
      setFrom("");
      setTo("");
      return;
    }
    setFrom(monthsAgo(months));
    setTo(today());
  };

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="font-display text-base font-semibold text-foreground">
        Šta preuzimate
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ex-type" className={lbl}>
            Vrsta podataka
          </label>
          <select
            id="ex-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={field}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {statusApplies && (
          <div>
            <label htmlFor="ex-status" className={lbl}>
              Status
            </label>
            <select
              id="ex-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={field}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {datesApply && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>
                Od datuma
              </label>
              <DateField
                value={from}
                locale="hr"
                placeholder="Odaberite…"
                onChange={(v) => {
                  setFrom(v);
                  if (to && to < v) setTo(v);
                }}
                className={field}
              />
            </div>
            <div>
              <label className={lbl}>
                Do datuma
              </label>
              <DateField
                value={to}
                min={from || undefined}
                locale="hr"
                placeholder="Odaberite…"
                onChange={setTo}
                className={field}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: "Sve", months: null },
              { label: "Zadnjih 30 dana", months: 1 },
              { label: "Zadnjih 6 mjeseci", months: 6 },
              { label: "Zadnjih godinu", months: 12 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => preset(p.months)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong"
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Ako ne odaberete datume, preuzimaju se svi zapisi.
          </p>
        </>
      )}

      <a
        href={href()}
        download
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 sm:w-auto"
      >
        <Download className="h-4 w-4" />
        Preuzmi tabelu
      </a>
    </div>
  );
}
