import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { Kpi } from "@/lib/analytics";

export function KpiCard({ kpi, note }: { kpi: Kpi; note: string }) {
  const { change, lowerIsBetter } = kpi;
  const flat = change === null || change === 0;
  const good = change !== null && (lowerIsBetter ? change < 0 : change > 0);

  const Icon = flat ? Minus : change! > 0 ? TrendingUp : TrendingDown;
  const tone = flat
    ? "text-muted-foreground"
    : good
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-brand-strong";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {kpi.label}
      </p>

      <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">
        {kpi.value}
      </p>

      <div className="mt-2 flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${tone}`} />
        <span className={`text-xs font-semibold tabular-nums ${tone}`}>
          {change === null
            ? "bez poređenja"
            : `${change > 0 ? "+" : ""}${change} %`}
        </span>
        {change !== null && (
          <span className="truncate text-xs text-muted-foreground">{note}</span>
        )}
      </div>

      {kpi.hint && (
        <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
          {kpi.hint}
        </p>
      )}
    </div>
  );
}
