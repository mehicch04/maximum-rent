import { Suspense } from "react";
import { BarChart3, Info } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import {
  COMPARED_TO,
  getAnalytics,
  getExtrasStats,
  getFleetStatus,
  getTopCars,
  getTrend,
  isRange,
  RANGE_LABEL,
} from "@/lib/analytics";
import { RangeFilter } from "@/components/admin/analytics/RangeFilter";
import { KpiCard } from "@/components/admin/analytics/KpiCard";
import { Section } from "@/components/admin/analytics/Section";
import { TrendChart } from "@/components/admin/analytics/TrendChart";
import { FleetDonut } from "@/components/admin/analytics/FleetDonut";
import { TopCarsTable } from "@/components/admin/analytics/TopCarsTable";
import { ExtrasTable } from "@/components/admin/analytics/ExtrasTable";

export const dynamic = "force-dynamic";

type RawSearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const raw = one(searchParams.period);
  const range = isRange(raw) ? raw : "month";

  // Only meaningful for a custom window; the presets work their own out.
  const custom = {
    from: one(searchParams.from),
    to: one(searchParams.to),
  };

  // A reporting screen must never take the panel down with it, so a failed
  // query falls back to empty sections that say so.
  let kpis: Awaited<ReturnType<typeof getAnalytics>>["kpis"] = [];
  let trend: Awaited<ReturnType<typeof getTrend>> = [];
  let topCars: Awaited<ReturnType<typeof getTopCars>> = [];
  let fleet: Awaited<ReturnType<typeof getFleetStatus>> = [];
  let extras: Awaited<ReturnType<typeof getExtrasStats>> = [];
  let failed = false;

  try {
    [{ kpis }, trend, topCars, fleet, extras] = await Promise.all([
      getAnalytics(range, custom),
      getTrend(range, custom),
      getTopCars(range, custom),
      getFleetStatus(),
      getExtrasStats(),
    ]);
  } catch (err) {
    console.error("[analytics] failed:", err);
    failed = true;
  }

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
          <RangeFilter value={range} from={custom.from} to={custom.to} />
        </Suspense>
      </div>

      {failed && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/[0.06] p-3 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-brand-strong" />
          Podaci se trenutno ne mogu učitati. Pokušajte osvježiti stranicu.
        </div>
      )}

      {/* ── KPI ── */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} note={COMPARED_TO[range]} />
        ))}
      </div>

      {/* ── Grafikoni ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Section
          title="Trend rezervacija i prihoda"
          subtitle={`Kretanje kroz ${RANGE_LABEL[range]}`}
          className="lg:col-span-3"
        >
          <TrendChart data={trend} />
        </Section>

        <Section
          title="Status flote"
          subtitle="Trenutno stanje, neovisno o periodu"
          delay={0.06}
          className="lg:col-span-2"
        >
          <FleetDonut data={fleet} />
        </Section>
      </div>

      {/* ── Tabele ── */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section
          title="Najprofitabilnija vozila"
          subtitle={`Pet najboljih za ${RANGE_LABEL[range]}`}
          delay={0.04}
        >
          <TopCarsTable data={topCars} />
        </Section>

        <Section
          title="Dodatna oprema"
          subtitle="Koliko je izdato, a koliko ostaje slobodno"
          delay={0.08}
        >
          <ExtrasTable data={extras} />
        </Section>
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Brojevi se računaju iz potvrđenih i završenih rezervacija. Otkazani i
        neodgovoreni upiti ne ulaze u prihod.
      </p>
    </div>
  );
}
