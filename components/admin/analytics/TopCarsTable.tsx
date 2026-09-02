"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { TopCar } from "@/lib/analytics";

/**
 * The five vehicles that earned the most.
 *
 * Each row carries a bar scaled against the best performer. Numbers alone make
 * the reader compare figures in their head; the bar shows the gap instantly,
 * and the gap is the point of the table.
 */
export function TopCarsTable({ data }: { data: TopCar[] }) {
  const reduce = useReducedMotion();

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
            <th className="pb-2 px-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Najmova
            </th>
            <th className="pb-2 pl-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Prihod
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr key={c.title} className="border-b border-border/60 last:border-0">
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[11px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {c.title}
                  </span>
                </div>
                <div className="mt-1.5 ml-7 h-1 overflow-hidden rounded-full bg-surface-muted">
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={reduce ? undefined : { scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      width: `${(c.revenue / max) * 100}%`,
                      transformOrigin: "left",
                    }}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
