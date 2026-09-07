"use client";

import { CheckCircle2 } from "lucide-react";

/**
 * Closing a rental.
 *
 * Pulled out of the menu and onto the card: for a vehicle that is out, this is
 * the only action anyone reaches for, and burying it behind a menu costs a tap
 * on every single return.
 */
export function FinishRentalButton({
  id,
  reference,
}: {
  id: string;
  reference: string;
}) {
  return (
    <button
      type="button"
      onClick={() => console.log("Otvara Check-in Modal", { id, reference })}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      Završi najam
    </button>
  );
}
