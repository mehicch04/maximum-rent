import { AlertTriangle } from "lucide-react";
import type { ExtraStat } from "@/lib/analytics";

const TIGHT = 0.8;

export function ExtrasTable({ data }: { data: ExtraStat[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nema unesene dodatne opreme.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Oprema
            </th>
            <th className="px-3 pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rentano
            </th>
            <th className="pb-2 pl-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Slobodno
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => {
            const free = Math.max(0, e.stock - e.rented);
            const ratio = e.stock > 0 ? e.rented / e.stock : 0;
            const tight = ratio >= TIGHT;
            // A sliver keeps a barely-used item from looking like an empty row.
            const width = Math.max(2, Math.min(100, ratio * 100));

            return (
              <tr key={e.name} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-0 truncate font-medium text-foreground">
                      {e.name}
                    </span>
                    {tight && (
                      <AlertTriangle
                        className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                        aria-label="Pri kraju"
                      />
                    )}
                  </div>

                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                        tight ? "bg-amber-500" : "bg-brand"
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </td>

                <td className="px-3 text-right align-top tabular-nums text-muted-foreground">
                  {e.rented} / {e.stock}
                </td>
                <td
                  className={`pl-3 text-right align-top font-semibold tabular-nums ${
                    free === 0
                      ? "text-brand-strong"
                      : tight
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-foreground"
                  }`}
                >
                  {free}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
