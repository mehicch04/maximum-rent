"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { migrateOldManualBlocks } from "@/app/admin/migrate-actions";

/**
 * One-off tool for moving phone bookings out of the blocks table.
 *
 * Shown only while there is something left to move, so once it has been run
 * the panel goes back to normal instead of carrying a button nobody will ever
 * press again.
 */
export function MigrateBlocksCard({ count }: { count: number }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (count === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/50 bg-amber-500/[0.07] p-5">
      <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
        <ArrowRightLeft className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        Stare manuelne rezervacije
      </p>

      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {count} {count === 1 ? "rezervacija je" : "rezervacija je"} dogovorena
        telefonom prije nego su dobile svoj ekran, pa {count === 1 ? "je zapisana" : "su zapisane"}{" "}
        među blokadama vozila. Zbog toga se prihod u izvještajima i u Excel
        izvozu ne poklapa.
      </p>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Prebacivanjem dobijaju svoj broj, pojavljuju se u listi rezervacija i
        ulaze u izvoz. Datum nastanka se zadržava, pa se izvještaji za prošle
        mjesece neće promijeniti. Stare blokade se brišu, a vozila ostaju
        zauzeta u istim terminima.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700"
        >
          Prebaci u rezervacije
        </button>
      ) : (
        <form action={migrateOldManualBlocks} onSubmit={() => setBusy(true)} className="mt-4">
          <p className="mb-2 text-xs font-medium text-foreground">
            Prebacuje se {count} {count === 1 ? "zapis" : "zapisa"}. Radnja se ne
            može poništiti.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Prebacujem…" : "Da, prebaci"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Odustani
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
