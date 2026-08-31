"use client";

import { useState } from "react";
import { Sun, Snowflake, AlertTriangle } from "lucide-react";
import { toggleSeasonal } from "@/app/admin/firma/actions";

/**
 * Switches the whole fleet between regular and seasonal rates.
 *
 * The state is shown loudly on purpose: leaving seasonal prices on after the
 * season ends would quietly overcharge every guest, and that mistake is easy
 * to make with a small, tidy toggle.
 */
export function SeasonalToggle({
  active,
  carsWithSeasonal,
}: {
  active: boolean;
  carsWithSeasonal: number;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        active
          ? "border-amber-500/50 bg-amber-500/[0.07]"
          : "border-border bg-surface shadow-card"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            {active ? (
              <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <Snowflake className="h-4 w-4 text-brand-strong" />
            )}
            Sezonske cijene
          </p>

          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {active ? (
              <>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  Trenutno su uključene.
                </span>{" "}
                Vozila sa unesenom sezonskom cijenom nude se po njoj. Vozila bez
                nje zadržavaju redovnu cijenu.
              </>
            ) : (
              <>Sva vozila se nude po redovnoj cijeni. Uključite ih kad počne sezona.</>
            )}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Sezonsku cijenu ima {carsWithSeasonal}{" "}
            {carsWithSeasonal === 1 ? "vozilo" : "vozila"}. Unosite je na
            stranici Vozila, uz redovnu cijenu.
          </p>
        </div>

        <form
          action={toggleSeasonal}
          onSubmit={() => setBusy(true)}
          className="shrink-0"
        >
          <input type="hidden" name="next" value={active ? "0" : "1"} />
          <button
            type="submit"
            disabled={busy}
            className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors disabled:opacity-60 ${
              active
                ? "border border-border bg-surface text-foreground hover:border-brand hover:text-brand-strong"
                : "bg-brand text-brand-foreground hover:bg-brand-700"
            }`}
          >
            {busy
              ? "Trenutak…"
              : active
                ? "Isključi sezonske cijene"
                : "Uključi sezonske cijene"}
          </button>
        </form>
      </div>

      {active && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Ne zaboravite isključiti kad sezona prođe, inače gosti i dalje
          plaćaju sezonsku cijenu.
        </p>
      )}
    </div>
  );
}
