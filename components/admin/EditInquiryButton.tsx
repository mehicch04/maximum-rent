"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Pencil, X } from "lucide-react";

/**
 * Opens the edit form, but asks first.
 *
 * Editing a confirmed reservation moves a vehicle that is already promised to
 * someone, so the click is deliberately made a two-step action rather than a
 * stray tap next to Confirm and Cancel.
 */
export function EditInquiryButton({
  reference,
  status,
  children,
}: {
  reference: string;
  status: string;
  /**
   * The form itself.
   *
   * Passed as a plain element rather than a render function: a function
   * cannot cross from a server component into a client one, and doing so
   * throws before the page ever renders.
   */
  children: React.ReactNode;
}) {
  const [asking, setAsking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!asking && !editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAsking(false);
      setEditing(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [asking, editing]);

  const confirmed = status === "CONFIRMED";

  return (
    <>
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand-strong"
      >
        <Pencil className="h-3.5 w-3.5" />
        Uredi
      </button>

      {mounted &&
        asking &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setAsking(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 shrink-0 text-brand-strong" />
                Uređivanje rezervacije
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Mijenjate rezervaciju{" "}
                <strong className="text-foreground">{reference}</strong>.
                {confirmed
                  ? " Rezervacija je već potvrđena, pa promjena datuma ili vozila utiče na ono što je gostu obećano."
                  : " Promjene se odmah upisuju."}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Gost neće automatski dobiti obavijest o izmjeni. Javite mu se
                sami ako mijenjate termin ili vozilo.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAsking(false);
                    setEditing(true);
                  }}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
                >
                  Nastavi
                </button>
                <button
                  type="button"
                  onClick={() => setAsking(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Odustani
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {mounted &&
        editing &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setEditing(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-card"
            >
              <div className="flex items-center justify-between gap-4 border-b border-border p-5">
                <p className="font-display text-base font-semibold text-foreground">
                  Uredi {reference}
                </p>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label="Zatvori"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand-strong"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5">{children}</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
