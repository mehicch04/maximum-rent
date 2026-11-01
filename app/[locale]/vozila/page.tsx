import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, ArrowRight, CalendarX } from "lucide-react";
import { intlLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getCompany } from "@/lib/company";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

import { type SearchContext } from "@/lib/types";
import { getAvailableCars, getNearestFreeWindows, isValidPeriod } from "@/lib/availability";
import { getBrowseCars, getActiveLocations } from "@/lib/fleet-data";
import { ReservationSearchForm } from "@/components/reservation/ReservationSearchForm";
import { ReservationSummary } from "@/components/reservation/ReservationSummary";
import { FleetGrid } from "@/components/fleet/FleetGrid";
import { CAR_CATEGORIES, type CarCategory } from "@/lib/car-categories";

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
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  return buildPageMetadata({
    locale,
    path: "/vozila",
    title: tSeo("fleet.title"),
    description: tSeo("fleet.description"),
    tab: tNav("vehicles"),
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

  const pickupLocationId = one(searchParams.pickupLocationId);
  const returnLocationId = one(searchParams.returnLocationId);
  const pickupAtRaw = one(searchParams.pickupAt);
  const returnAtRaw = one(searchParams.returnAt);
  const tipRaw = one(searchParams.tip);
  const initialType = (CAR_CATEGORIES as readonly string[]).includes(tipRaw ?? "")
    ? (tipRaw as CarCategory)
    : undefined;

  const hasDates = isValidISO(pickupAtRaw) && isValidISO(returnAtRaw);
  const pickupDate = hasDates ? new Date(pickupAtRaw) : null;
  const returnDate = hasDates ? new Date(returnAtRaw) : null;
  // Dates present but return <= pickup → show a friendly notice + all cars.
  const periodValid =
    !!pickupDate && !!returnDate && isValidPeriod(pickupDate, returnDate);
  const periodInvalid = hasDates && !periodValid;

  const [cars, locations, company] = await Promise.all([
    periodValid ? getAvailableCars(pickupDate!, returnDate!) : getBrowseCars(),
    getActiveLocations(),
    getCompany(),
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
  const windows = periodValid && items.length === 0 ? await getNearestFreeWindows(pickupDate!, returnDate!).catch(() => []) : [];
  const day = new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "Europe/Sarajevo", weekday: "short", day: "numeric", month: "short" });
  const windowHref = (w: { pickupAt: string; returnAt: string }) => {
    const q = new URLSearchParams();
    if (pickupLocationId) q.set("pickupLocationId", pickupLocationId);
    if (returnLocationId) q.set("returnLocationId", returnLocationId);
    q.set("pickupAt", w.pickupAt);
    q.set("returnAt", w.returnAt);
    return `/vozila?${q.toString()}`;
  };
  const heading = periodValid ? t("resultsTitle") : t("allVehicles");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={heading} lead={t("subtitle")} image="/fleet-aerial.webp" position="object-[center_60%]" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="relative z-10 -mt-14 sm:-mt-16">
          <ReservationSearchForm locations={locations} />
        </div>

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
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{t("invalidPeriod")}</p>
          </div>
        )}

        {items.length > 0 ? (
          <div className="mt-10 sm:mt-12">
            <FleetGrid
              cars={items}
              search={search}
              eagerFirstImages
              initialType={initialType}
              imageSizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 31vw"
            />
          </div>
        ) : (
          <div className="mt-10 rounded-[28px] bg-surface p-8 text-center ring-1 ring-border sm:mt-12 sm:p-12">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand-strong">
              <CalendarX className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-foreground sm:text-2xl">{t("noResultsTitle")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{t("noResults")}</p>
            {windows.length > 0 && (
              <div className="mx-auto mt-8 max-w-2xl text-left">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("nearestTitle")}</p>
                <p className="mt-1 text-center text-sm text-muted-foreground">{t("nearestLead")}</p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  {windows.map((w) => (
                    <li key={w.pickupAt}>
                      <Link
                        href={windowHref(w)}
                        className="group flex h-full flex-col rounded-2xl bg-surface-muted p-4 ring-1 ring-transparent transition-[box-shadow,background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-surface hover:ring-brand/30 hover:shadow-[0_18px_40px_-26px_rgba(227,6,19,0.45)]"
                      >
                        <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
                          <span className="inline-block first-letter:uppercase">{day.format(new Date(w.pickupAt))}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="inline-block first-letter:uppercase">{day.format(new Date(w.returnAt))}</span>
                        </span>
                        <span className="mt-1 text-xs font-medium text-emerald-700">{t("freeN", { count: w.free })}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-center text-sm text-muted-foreground">{t("orAsk")}</p>
              </div>
            )}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/vozila" className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink/90">
                {t("showAll")}
              </Link>
              {company.whatsapp && (
                <a
                  href={`https://wa.me/${company.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-ink transition-[filter] hover:brightness-105"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t("askUs")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
