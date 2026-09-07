"use client";

import { AlertTriangle } from "lucide-react";
import { busyCarsFor, type CarBusy } from "@/lib/extras-availability";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("hr-HR", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
  }).format(d);

/**
 * Warns that a pending enquiry can no longer be approved as it stands.
 *
 * Two guests often ask for the same car on the same days. The moment one is
 * confirmed the other becomes impossible, but nothing said so: the enquiry sat
 * in the list looking ordinary until somebody pressed confirm and got a bare
 * error. This says it up front, and says what can be offered instead.
 */
export function ConflictNotice({
  carId,
  pickupAt,
  returnAt,
  occupancy,
  cars,
}: {
  carId: string | null;
  pickupAt: string;
  returnAt: string;
  occupancy: CarBusy[];
  cars: { id: string; title: string; pricePerDay: number | null }[];
}) {
  if (!carId) return null;

  const from = new Date(pickupAt);
  const to = new Date(returnAt);
  const busy = busyCarsFor(occupancy, from, to);

  const why = busy.get(carId);
  if (!why) return null;

  const alternatives = cars.filter((c) => c.id !== carId && !busy.has(c.id));

  return (
    <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/[0.07] p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Vozilo je u međuvremenu zauzeto ({why})
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ovaj upit se ne može potvrditi za {fmt(from)} – {fmt(to)} na traženom
        vozilu.
      </p>

      {alternatives.length === 0 ? (
        <p className="mt-2 text-xs font-medium text-brand-strong">
          Nijedno vozilo nije slobodno u tom periodu.
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs font-medium text-foreground">
            Slobodno za te datume ({alternatives.length}):
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {alternatives.slice(0, 6).map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground"
              >
                {c.title}
                {c.pricePerDay != null && (
                  <span className="ml-1 text-muted-foreground">
                    {c.pricePerDay} KM
                  </span>
                )}
              </li>
            ))}
            {alternatives.length > 6 && (
              <li className="px-1 py-1 text-xs text-muted-foreground">
                +{alternatives.length - 6} još
              </li>
            )}
          </ul>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Ponudite gostu jedno od njih, pa kroz Uredi promijenite vozilo prije
            potvrde.
          </p>
        </>
      )}
    </div>
  );
}
