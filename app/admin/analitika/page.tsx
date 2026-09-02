import { Suspense } from "react";
import { BarChart3, Info } from "lucide-react";
import { COMPARED_TO, getAnalytics, isRange, RANGE_LABEL } from "@/lib/analytics";
import { RangeFilter } from "@/components/admin/analytics/RangeFilter";
import { KpiCard } from "@/components/admin/analytics/KpiCard";

export const dynamic = "force-dynamic";

type RawSearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const raw = one(searchParams.period);
  const range = isRange(raw) ? raw : "month";
  const { kpis } = getAnalytics(range);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
            <BarChart3 className="h-6 w-6 text-brand-strong" />
            Analitika i statistika
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Pregled poslovanja za {RANGE_LABEL[range]}.
          </p>
        </div>

        {/* Suspense is required because the filter reads the URL query. */}
        <Suspense fallback={<div className="h-11 w-full sm:w-52" />}>
          <RangeFilter value={range} />
        </Suspense>
      </div>

      {/* ── KPI ── */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} note={COMPARED_TO[range]} />
        ))}
      </div>

      {/* ── Mjesto za grafikone i tabele (faza 2) ── */}
      <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Ovdje dolaze grafikoni i tabele.
        </p>
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Prikazani brojevi su privremeni, dok se ne poveže na stvarne
        rezervacije.
      </p>
    </div>
  );
}
