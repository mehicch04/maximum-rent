"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, X } from "lucide-react";

export type ReservationDetailData = {
  reference: string;
  status: string;
  channel: string;
  guest: string;
  email: string;
  phone: string;
  flightNumber: string | null;
  carTitle: string;
  plate: string;
  pickupLocation: string;
  returnLocation: string;
  /** What was agreed. */
  pickupAt: string;
  returnAt: string;
  /** What actually happened, where it was recorded. */
  actualPickUpTime: string | null;
  actualDropOffTime: string | null;
  rentalDays: number | null;
  totalPrice: number | null;
  returnFuel: string | null;
  depositStatus: string | null;
  extraCharge: number | null;
  extraChargeNote: string | null;
  statusNote: string | null;
  message: string | null;
  createdAt: string;
  extras: { name: string; qty: number }[];
  continuesFrom: string | null;
  continuedBy: string[];
};

const STATUS: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Kontaktiran",
  CONFIRMED: "Potvrđeno",
  IN_PROGRESS: "U toku",
  CANCELLED: "Otkazano",
  COMPLETED: "Završeno",
};

const CHANNEL: Record<string, string> = {
  EMAIL: "Web",
  WHATSAPP: "WhatsApp",
  MANUAL: "Telefon / uživo",
};

const DEPOSIT: Record<string, string> = {
  RETURNED: "Vraćen u cijelosti",
  PARTIAL: "Djelimično zadržan",
  WITHHELD: "Zadržan zbog štete",
};

const dt = (v: string | null) =>
  v
    ? new Intl.DateTimeFormat("hr-HR", {
        timeZone: "Europe/Sarajevo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(v))
    : null;

/** "2 h ranije", "45 min kasnije" — the gap between plan and reality. */
function drift(planned: string, actual: string | null): string | null {
  if (!actual) return null;
  const diff = new Date(actual).getTime() - new Date(planned).getTime();
  const mins = Math.round(Math.abs(diff) / 60_000);
  if (mins < 10) return "na vrijeme";
  const span =
    mins < 60
      ? `${mins} min`
      : mins < 1440
        ? `${Math.round(mins / 60)} h`
        : `${Math.round(mins / 1440)} dana`;
  return diff > 0 ? `${span} kasnije` : `${span} ranije`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm text-foreground">{value}</dd>
    </div>
  );
}

/**
 * Everything that happened to one reservation, on one screen.
 *
 * Once a rental is closed the card in the list shows almost nothing, yet the
 * questions come later: was the guest late, what was charged, why is there a
 * second booking under the same name. All of it was already recorded, just
 * spread across fields nobody could see.
 */
export function ReservationDetail({ data }: { data: ReservationDetailData }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pickDrift = drift(data.pickupAt, data.actualPickUpTime);
  const dropDrift = drift(data.returnAt, data.actualDropOffTime);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand-strong"
      >
        <Eye className="h-3.5 w-3.5" />
        Pogledaj
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="my-8 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-card"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="font-display text-base font-semibold text-foreground">
                    {data.reference}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {STATUS[data.status] ?? data.status} ·{" "}
                    {CHANNEL[data.channel] ?? data.channel} · zaprimljeno{" "}
                    {dt(data.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Zatvori"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <section>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
                    Klijent
                  </p>
                  <dl className="divide-y divide-border">
                    <Row label="Ime" value={data.guest} />
                    <Row label="Telefon" value={data.phone} />
                    <Row label="Email" value={data.email} />
                    <Row label="Broj leta" value={data.flightNumber} />
                  </dl>
                </section>

                <section>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
                    Vozilo i period
                  </p>
                  <dl className="divide-y divide-border">
                    <Row
                      label="Vozilo"
                      value={
                        data.carTitle
                          ? `${data.carTitle}${data.plate ? ` · ${data.plate}` : ""}`
                          : "—"
                      }
                    />
                    <Row
                      label="Lokacije"
                      value={`${data.pickupLocation || "—"} → ${data.returnLocation || "—"}`}
                    />
                    <Row label="Dogovoreno preuzimanje" value={dt(data.pickupAt)} />
                    <Row
                      label="Stvarno preuzimanje"
                      value={
                        data.actualPickUpTime ? (
                          <>
                            {dt(data.actualPickUpTime)}
                            {pickDrift && pickDrift !== "na vrijeme" && (
                              <span className="ml-1.5 text-xs text-muted-foreground">
                                ({pickDrift})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">nije zabilježeno</span>
                        )
                      }
                    />
                    <Row label="Dogovoreno vraćanje" value={dt(data.returnAt)} />
                    <Row
                      label="Stvarno vraćanje"
                      value={
                        data.actualDropOffTime ? (
                          <>
                            {dt(data.actualDropOffTime)}
                            {dropDrift && dropDrift !== "na vrijeme" && (
                              <span
                                className={`ml-1.5 text-xs ${
                                  dropDrift.includes("kasnije")
                                    ? "font-medium text-brand-strong"
                                    : "text-muted-foreground"
                                }`}
                              >
                                ({dropDrift})
                              </span>
                            )}
                          </>
                        ) : null
                      }
                    />
                    <Row label="Trajanje" value={data.rentalDays ? `${data.rentalDays} dana` : null} />
                  </dl>
                </section>

                {data.extras.length > 0 && (
                  <section>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
                      Dodatna oprema
                    </p>
                    <p className="text-sm text-foreground">
                      {data.extras
                        .map((e) => `${e.name}${e.qty > 1 ? ` ×${e.qty}` : ""}`)
                        .join(", ")}
                    </p>
                  </section>
                )}

                <section>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
                    Finansije
                  </p>
                  <dl className="divide-y divide-border">
                    <Row
                      label="Ugovoreni iznos"
                      value={data.totalPrice != null ? `${data.totalPrice} KM` : null}
                    />
                    <Row
                      label="Dodatna naplata"
                      value={
                        data.extraCharge != null && data.extraCharge > 0 ? (
                          <>
                            {data.extraCharge} KM
                            {data.extraChargeNote && (
                              <span className="block text-xs text-muted-foreground">
                                {data.extraChargeNote}
                              </span>
                            )}
                          </>
                        ) : null
                      }
                    />
                    <Row
                      label="Depozit"
                      value={data.depositStatus ? DEPOSIT[data.depositStatus] ?? data.depositStatus : null}
                    />
                    <Row label="Gorivo pri povratu" value={data.returnFuel} />
                  </dl>
                </section>

                {(data.continuesFrom || data.continuedBy.length > 0) && (
                  <section className="rounded-xl border border-sky-500/40 bg-sky-500/[0.06] p-3">
                    <p className="text-xs font-semibold text-foreground">
                      Zamjena vozila
                    </p>
                    {data.continuesFrom && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Nastavlja se na{" "}
                        <span className="font-mono text-foreground">
                          {data.continuesFrom}
                        </span>
                      </p>
                    )}
                    {data.continuedBy.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Ima nastavak{" "}
                        <span className="font-mono text-foreground">
                          {data.continuedBy.join(", ")}
                        </span>
                      </p>
                    )}
                  </section>
                )}

                {(data.statusNote || data.message) && (
                  <section>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
                      Napomene
                    </p>
                    {data.message && (
                      <p className="text-sm leading-relaxed text-foreground">
                        {data.message}
                      </p>
                    )}
                    {data.statusNote && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.statusNote}
                      </p>
                    )}
                  </section>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
