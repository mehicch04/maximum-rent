"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";

/**
 * Opens the manual reservation form.
 *
 * Unlike the edit button this asks nothing first: creating a booking touches
 * no existing record, so a confirmation step would only be in the way.
 */
export function NewReservationButton({ children }: { children: React.ReactNode }) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
      >
        <Plus className="h-4 w-4" />
        Nova rezervacija
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Nova rezervacija"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="my-8 w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-card"
            >
              <div className="flex items-center justify-between gap-4 border-b border-border p-5">
                <div>
                  <p className="font-display text-base font-semibold text-foreground">
                    Nova rezervacija
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Dogovorena telefonom ili uživo. Sprema se kao potvrđena.
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
              <div className="p-5">{children}</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
