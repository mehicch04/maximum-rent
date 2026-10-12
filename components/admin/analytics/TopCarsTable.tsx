import type { TopCar } from "@/lib/analytics";

export function TopCarsTable({ data }: { data: TopCar[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nema podataka za odabrani period.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 pr-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vozilo
            </th>
            <th className="px-3 pb-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Najmova
            </th>
            <th className="pb-2 pl-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Prihod
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => {
            const share = Math.max(2, (c.revenue / max) * 100);
            return (
              <tr key={c.id} className="border-b border-border/60 last:border-0">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[11px] font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {c.title}
                      </span>
                      {c.plate && (
                        <span className="block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                          {c.plate}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="ml-7 mt-1.5 h-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </td>

                <td className="px-3 text-right align-top tabular-nums text-muted-foreground">
                  {c.rentals}
                </td>
                <td className="pl-3 text-right align-top font-semibold tabular-nums text-foreground">
                  {c.revenue.toLocaleString("hr-HR")} KM
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
