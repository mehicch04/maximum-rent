"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Link2, X } from "lucide-react";

const dt = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("hr-HR", {
        timeZone: "Europe/Sarajevo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : "—";

const FUEL_LABEL: Record<string, string> = {
  RETURNED: "Vraćen u cijelosti",
  PARTIAL: "Djelimično zadržan",
  WITHHELD: "Zadržan zbog štete",
};

export type InquiryDetail = {
  id: string;
  reference: string;
  status: string;
  channel: string;
  createdAt: string;
  guest: string;
  email: string;
  phone: string;
  flightNumber: string | null;
  message: string | null;
  carTitle: string;
  plate: string;
  pickupLocation: string;
  returnLocation: string;
  pickupAt: string;
  returnAt: string;
  actualPickUpTime: string | null;
  actualDropOffTime: string | null;
  rentalDays: number | null;
  totalPrice: number | null;
  extras: { name: string; qty: number }[];
  returnFuel: string | null;
  depositStatus: string | null;
  extraCharge: number | null;
  extraChargeNote: string | null;
  statusNote: string | null;
  continuesFrom: { reference: string; carTitleSnapshot: string | null } | null;
  continuedBy: { reference: string; carTitleSnapshot: string | null }[];
};

/** One labelled line; skipped entirely when there is nothing to show. */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "" || value === "—") {
    return null;
  }
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 border-b border-border pb-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
        {title}
      </p>
      <dl>{children}</dl>
    </div>
  );
}

/**
 * Everything that happened to one reservation, on one screen.
 *
 * A finished rental is scattered across half a dozen fields: what was agreed,
 * when the keys actually moved, how late it came back, what the deposit did.
 * Chasing that through the edit form means reading a form built for changing
 * things, which is the wrong tool for looking something up.
 */
export function InquiryDetailButton({ data }: { data: InquiryDetail }) {
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

  // Late by more than a few minutes is worth stating; a couple of minutes is
  // noise and would make every rental look problematic.
  const lateBy = (() => {
    if (!data.actualDropOffTime) return null;
    const diff =
      new Date(data.actualDropOffTime).getTime() - new Date(data.returnAt).getTime();
    if (diff < 10 * 60_000) return null;
    const h = Math.round(diff / 3_600_000);
    return h < 24 ? `${h} h` : `${Math.round(h / 24)} dana`;
  })();

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
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-foreground">
                    {data.reference}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {data.guest} · {data.carTitle || "bez vozila"}
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
                {(data.continuesFrom || data.continuedBy.length > 0) && (
                  <div className="rounded-xl border border-sky-500/50 bg-sky-500/[0.07] p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                      Dio zamjene vozila
                    </p>
                    {data.continuesFrom && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Nastavlja se na{" "}
                        <span className="font-mono text-foreground">
                          {data.continuesFrom.reference}
                        </span>{" "}
                        ({data.continuesFrom.carTitleSnapshot || "vozilo"})
                      </p>
                    )}
                    {data.continuedBy.map((c) => (
                      <p key={c.reference} className="mt-1 text-xs text-muted-foreground">
                        Ima nastavak{" "}
                        <span className="font-mono text-foreground">{c.reference}</span>{" "}
                        ({c.carTitleSnapshot || "vozilo"})
                      </p>
                    ))}
                  </div>
                )}

                <Section title="Klijent">
                  <Row label="Ime" value={data.guest} />
                  <Row label="Telefon" value={data.phone} />
                  <Row label="Email" value={data.email} />
                  <Row label="Broj leta" value={data.flightNumber} />
                </Section>

                <Section title="Najam">
                  <Row label="Vozilo" value={data.carTitle} />
                  <Row label="Registracija" value={data.plate} />
                  <Row label="Preuzimanje" value={dt(data.pickupAt)} />
                  <Row label="Vraćanje" value={dt(data.returnAt)} />
                  <Row label="Lokacija preuzimanja" value={data.pickupLocation} />
                  <Row label="Lokacija vraćanja" value={data.returnLocation} />
                  <Row
                    label="Trajanje"
                    value={data.rentalDays ? `${data.rentalDays} dana` : null}
                  />
                  <Row
                    label="Oprema"
                    value={
                      data.extras.length
                        ? data.extras
                            .map((e) => `${e.name}${e.qty > 1 ? ` ×${e.qty}` : ""}`)
                            .join(", ")
                        : null
                    }
                  />
                </Section>

                {/* Only for rentals that actually went out; on a pending
                    enquiry every line here would be a dash. */}
                {(data.actualPickUpTime || data.actualDropOffTime) && (
                  <Section title="Kako je proteklo">
                    <Row label="Stvarno preuzeto" value={dt(data.actualPickUpTime)} />
                    <Row label="Stvarno vraćeno" value={dt(data.actualDropOffTime)} />
                    {lateBy && (
                      <div className="flex justify-between gap-4 py-1">
                        <dt className="text-xs text-muted-foreground">Kašnjenje</dt>
                        <dd className="text-right text-xs font-semibold text-brand-strong">
                          {lateBy}
                        </dd>
                      </div>
                    )}
                    <Row label="Gorivo pri povratu" value={data.returnFuel} />
                    <Row
                      label="Depozit"
                      value={
                        data.depositStatus
                          ? FUEL_LABEL[data.depositStatus] ?? data.depositStatus
                          : null
                      }
                    />
                  </Section>
                )}

                <Section title="Finansije">
                  <Row
                    label="Ugovoreni iznos"
                    value={data.totalPrice != null ? `${data.totalPrice} KM` : null}
                  />
                  <Row
                    label="Dodatna naplata"
                    value={
                      data.extraCharge ? `${data.extraCharge} KM` : null
                    }
                  />
                  <Row label="Razlog naplate" value={data.extraChargeNote} />
                  {data.extraCharge ? (
                    <div className="mt-1 flex justify-between gap-4 border-t border-border pt-1">
                      <dt className="text-xs font-semibold text-foreground">Ukupno</dt>
                      <dd className="text-right text-sm font-bold text-foreground">
                        {(data.totalPrice ?? 0) + data.extraCharge} KM
                      </dd>
                    </div>
                  ) : null}
                </Section>

                <Section title="Zapis">
                  <Row label="Zaprimljeno" value={dt(data.createdAt)} />
                  <Row
                    label="Kanal"
                    value={
                      { EMAIL: "Web", WHATSAPP: "WhatsApp", MANUAL: "Telefon / uživo" }[
                        data.channel
                      ] ?? data.channel
                    }
                  />
                  <Row label="Napomena gosta" value={data.message} />
                  <Row label="Napomena o statusu" value={data.statusNote} />
                </Section>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
