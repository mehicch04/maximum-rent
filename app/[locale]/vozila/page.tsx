import type { Metadata } from "next";
import ReactDOM from "react-dom";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { toCarListItem, type SearchContext } from "@/lib/types";
import { getAvailableCars, isValidPeriod } from "@/lib/availability";
import { ReservationSearchForm } from "@/components/reservation/ReservationSearchForm";
import { ReservationSummary } from "@/components/reservation/ReservationSummary";
import { FleetGrid } from "@/components/fleet/FleetGrid";

type RawSearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isValidISO(value?: string): value is string {
  return !!value && !Number.isNaN(Date.parse(value));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  return buildPageMetadata({
    locale,
    path: "/vozila",
    title: tSeo("fleet.title"),
    description: tSeo("fleet.description"),
  });
}

export default async function VehiclesPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: RawSearchParams;
}) {
  setRequestLocale(locale);
  const t = await getTranslations("Fleet");

  // Warm up the Supabase Storage connection early — the car photos load from
  // there, so the browser doesn't pay DNS+TLS cost only once they're needed.
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl) {
    ReactDOM.preconnect(supabaseUrl, { crossOrigin: "anonymous" });
  }

  const pickupLocationId = one(searchParams.pickupLocationId);
  const returnLocationId = one(searchParams.returnLocationId);
  const pickupAtRaw = one(searchParams.pickupAt);
  const returnAtRaw = one(searchParams.returnAt);

  const hasDates = isValidISO(pickupAtRaw) && isValidISO(returnAtRaw);
  const pickupDate = hasDates ? new Date(pickupAtRaw) : null;
  const returnDate = hasDates ? new Date(returnAtRaw) : null;
  // Dates present but return <= pickup → show a friendly notice + all cars.
  const periodValid =
    !!pickupDate && !!returnDate && isValidPeriod(pickupDate, returnDate);
  const periodInvalid = hasDates && !periodValid;

  const [cars, locations] = await Promise.all([
    periodValid
      ? getAvailableCars(pickupDate!, returnDate!)
      : prisma.car
          .findMany({
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
          })
          .then((rows) => rows.map(toCarListItem)),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, city: true },
    }),
  ]);

  const byId = new Map(locations.map((l) => [l.id, l]));
  const pickupLocation = pickupLocationId ? byId.get(pickupLocationId) : null;
  const returnLocation = returnLocationId ? byId.get(returnLocationId) : null;

  const search: SearchContext = {
    pickupLocationId,
    returnLocationId,
    pickupLocation: pickupLocation ? { name: pickupLocation.name } : null,
    returnLocation: returnLocation ? { name: returnLocation.name } : null,
    pickupAt: periodValid ? pickupAtRaw : null,
    returnAt: periodValid ? returnAtRaw : null,
  };

  const items = cars;
  const heading = periodValid ? t("resultsTitle") : t("allVehicles");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <ReservationSearchForm locations={locations} />

      {periodValid && (
        <div className="mt-8">
          <ReservationSummary
            pickupAt={pickupAtRaw!}
            returnAt={returnAtRaw!}
            pickupName={pickupLocation?.name}
            returnName={returnLocation?.name}
          />
        </div>
      )}

      {periodInvalid && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{t("invalidPeriod")}</p>
        </div>
      )}

      <div className="mb-8 mt-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {items.length > 0 ? (
        <FleetGrid
          cars={items}
          search={search}
          locations={locations.map((l) => ({ id: l.id, name: l.name }))}
          eagerFirstImages
        />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted-foreground">
          {t("noResults")}
        </p>
      )}
    </div>
  );
}
