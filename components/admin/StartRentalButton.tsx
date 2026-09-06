"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { startRental } from "@/app/admin/checkout-actions";

/**
 * Marks a reservation as handed over.
 *
 * Asks first: the click records a real-world event and there is no undo, so it
 * should not be one stray tap next to the other actions on the card.
 */
export function StartRentalButton({
  id,
  reference,
  guest,
  carTitle,
}: {
  id: string;
  reference: string;
  guest: string;
  carTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Izdaj vozilo
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <KeyRound className="h-4 w-4 shrink-0 text-brand-strong" />
                Potvrdite izdavanje vozila klijentu?
              </p>

              <div className="mt-3 space-y-1 rounded-xl bg-surface-muted/60 px-3 py-2.5 text-sm">
                <p className="text-foreground">
                  <span className="text-muted-foreground">Klijent:</span> {guest}
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">Vozilo:</span>{" "}
                  {carTitle || "—"}
                </p>
                <p className="text-xs text-muted-foreground">{reference}</p>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Bilježi se trenutno vrijeme kao stvarno preuzimanje, a
                rezervacija prelazi u status <strong>U toku</strong>. Vozilo
                ostaje zauzeto dok ne završite najam.
              </p>

              <form
                action={startRental}
                onSubmit={() => setBusy(true)}
                className="mt-4 flex gap-2"
              >
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy ? "Bilježim…" : "Da, izdaj"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                  className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Odustani
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
