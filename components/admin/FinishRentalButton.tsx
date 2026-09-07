"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Clock, Fuel, Loader2, ShieldCheck, X } from "lucide-react";
import { finishRental } from "@/app/admin/checkout-actions";
import { DEPOSIT_STATUSES, FUEL_LEVELS } from "@/lib/rental-return";

const input =
  "h-10 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30 sm:text-sm";
const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

/**
 * Closing a rental: what came back, in what state, and what it cost.
 *
 * Pulled out of the menu and onto the card, because for a vehicle that is out
 * this is the only action anyone reaches for.
 */
export function FinishRentalButton({
  id,
  reference,
  guest,
  carTitle,
  returnAt,
  handoverMissing = false,
}: {
  id: string;
  reference: string;
  guest?: string;
  carTitle?: string;
  /** Agreed return time, used to show how late the car actually is. */
  returnAt?: string;
  /** True when the car went out without the handover being recorded. */
  handoverMissing?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [charge, setCharge] = useState("");
  const [note, setNote] = useState("");

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

  const amount = Number(charge.replace(",", "."));
  const hasCharge = charge.trim() !== "" && Number.isFinite(amount) && amount > 0;
  // A charge with no reason is what gets questioned later, so it blocks saving.
  const needsNote = hasCharge && note.trim() === "";

  const late =
    returnAt && new Date(returnAt).getTime() < Date.now()
      ? Math.round((Date.now() - new Date(returnAt).getTime()) / 60_000)
      : 0;

  const lateText =
    late < 60
      ? `${late} min`
      : late < 1440
        ? `${Math.round(late / 60)} h`
        : `${Math.round(late / 1440)} dana`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Završi najam
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
                    Povrat vozila
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {guest || "—"} · {carTitle || "—"} · {reference}
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

              <form
                action={finishRental}
                onSubmit={() => setBusy(true)}
                className="space-y-4 p-5"
              >
                <input type="hidden" name="id" value={id} />

                {handoverMissing && (
                  <p className="rounded-xl border border-amber-500/40 bg-amber-500/[0.07] px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                    Izdavanje ovog vozila nije zabilježeno. Zatvaranjem najma
                    upisuje se dogovoreno vrijeme preuzimanja.
                  </p>
                )}

                {late > 0 && (
                  <p className="flex items-center gap-1.5 rounded-xl border border-brand/40 bg-brand/[0.06] px-3 py-2 text-xs font-medium text-brand-strong">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    Vozilo se vraća {lateText} nakon dogovorenog vremena.
                  </p>
                )}

                <div>
                  <label className={`${lbl} flex items-center gap-1.5`}>
                    <Fuel className="h-3.5 w-3.5" />
                    Stanje goriva pri povratu
                  </label>
                  <select name="returnFuel" defaultValue="Pun" className={input}>
                    {FUEL_LEVELS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`${lbl} flex items-center gap-1.5`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Status depozita
                  </label>
                  <select
                    name="depositStatus"
                    defaultValue="RETURNED"
                    className={input}
                  >
                    {DEPOSIT_STATUSES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                  <div>
                    <label className={lbl}>Dodatna naplata (KM)</label>
                    <input
                      name="extraCharge"
                      inputMode="decimal"
                      value={charge}
                      onChange={(e) => setCharge(e.target.value)}
                      placeholder="0"
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={lbl}>
                      Opis troška {hasCharge && <span className="text-brand-strong">*</span>}
                    </label>
                    <input
                      name="extraChargeNote"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={200}
                      placeholder="npr. nedostaje pola rezervoara"
                      className={input}
                    />
                  </div>
                </div>

                {needsNote && (
                  <p className="text-xs font-medium text-brand-strong">
                    Upišite zbog čega naplaćujete. Iznos bez objašnjenja se
                    kasnije ne može opravdati gostu.
                  </p>
                )}

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Bilježi se trenutno vrijeme kao stvarni povrat, najam prelazi
                  u <strong>Završeno</strong>, a vozilo i oprema odmah postaju
                  slobodni za nove rezervacije.
                </p>

                <button
                  type="submit"
                  disabled={busy || needsNote}
                  className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-50"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy
                    ? "Zatvaram najam…"
                    : needsNote
                      ? "Upišite opis troška"
                      : "Potvrdi povrat"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
