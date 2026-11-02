import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { carDescription } from "@/lib/car-text";
import { CLASS_LABELS, FUEL_LABELS, TRANSMISSION_LABELS, label } from "@/lib/car-labels";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";

import { getCarBySlug, getSimilarCars } from "@/lib/car-detail";
import { getActiveLocations } from "@/lib/fleet-data";
import { getActiveExtras } from "@/lib/extras";
import { getCarBusy } from "@/lib/car-busy";
import { SITE_URL } from "@/lib/seo";
import { CarDetail } from "@/components/fleet/CarDetail";

export const revalidate = 60;

type Props = { params: { locale: string; slug: string } };

const FALLBACK: Record<AppLocale, (title: string, seats: number, gear: string, fuel: string) => string> = {
  hr: (t, s, g, f) => `Iznajmite ${t} u Mostaru, Međugorju i Čitluku. ${s} sjedala, ${g.toLowerCase()} mjenjač, ${f.toLowerCase()}.`,
  en: (t, s, g, f) => `Rent a ${t} in Mostar, Međugorje and Čitluk. ${s} seats, ${g.toLowerCase()} gearbox, ${f.toLowerCase()}.`,
  de: (t, s, g, f) => `Mieten Sie einen ${t} in Mostar, Međugorje und Čitluk. ${s} Sitze, ${g}, ${f}.`,
  es: (t, s, g, f) => `Alquila un ${t} en Mostar, Međugorje y Čitluk. ${s} plazas, cambio ${g.toLowerCase()}, ${f.toLowerCase()}.`,
};

function fallbackDescription(
  car: { title: string; passengers: number; transmission: keyof typeof TRANSMISSION_LABELS; fuelType: keyof typeof FUEL_LABELS },
  locale: string,
): string {
  const l = (locale in FALLBACK ? locale : "hr") as AppLocale;
  return FALLBACK[l](car.title, car.passengers, label(TRANSMISSION_LABELS[car.transmission], l), label(FUEL_LABELS[car.fuelType], l));
}

const FUEL_SCHEMA: Record<string, string> = { DIESEL: "Diesel", PETROL: "Gasoline", HYBRID: "Hybrid", PLUG_IN_HYBRID: "Plug-in hybrid", ELECTRIC: "Electric" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car) return { title: { absolute: "Maximum Rent a Car" } };

  const description = carDescription(car, params.locale) ?? fallbackDescription(car, params.locale);

  const url = `${SITE_URL}/${params.locale}/vozila/${car.slug}`;

  return {
    title: car.title,
    description: description.slice(0, 160),
    alternates: {
      canonical: url,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}/vozila/${car.slug}`])),
    },
    openGraph: {
      title: car.title,
      description: description.slice(0, 160),
      url,
      images: car.images?.length ? [{ url: car.images[0] }] : undefined,
      type: "website",
    },
  };
}

export default async function CarPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  const [similar, locations, extras, busy, t] = await Promise.all([
    getSimilarCars(car.slug, car.carClass),
    getActiveLocations(),
    getActiveExtras(),
    getCarBusy(car.id),
    getTranslations("Nav"),
  ]);
  const base = `${SITE_URL}/${params.locale}`;
  const crumbs = [
    { name: t("home"), url: base },
    { name: t("vehicles"), url: `${base}/vozila` },
    { name: car.title, url: `${base}/vozila/${car.slug}` },
  ];
  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  };

  const url = `${SITE_URL}/${params.locale}/vozila/${car.slug}`;
  const lang = (params.locale in FALLBACK ? params.locale : "hr") as AppLocale;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.title,
    url,
    image: (car.images ?? []).map((src) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)),
    description: carDescription(car, params.locale) ?? fallbackDescription(car, params.locale),
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    bodyType: label(CLASS_LABELS[car.carClass], lang),
    fuelType: FUEL_SCHEMA[car.fuelType] ?? car.fuelType,
    vehicleTransmission: car.transmission === "AUTOMATIC" ? "https://schema.org/AutomaticTransmission" : "https://schema.org/ManualTransmission",
    numberOfDoors: car.doors,
    vehicleSeatingCapacity: car.passengers,
    ...(car.emissionClass ? { meetsEmissionStandard: car.emissionClass } : {}),
    offers: car.pricePerDay
      ? {
          "@type": "Offer",
          url,
          price: car.pricePerDay,
          priceCurrency: car.currency ?? "BAM",
          businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
          availability: car.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: car.pricePerDay,
            priceCurrency: car.currency ?? "BAM",
            unitCode: "DAY",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
          },
          seller: { "@id": `${SITE_URL}/#business` },
        }
      : undefined,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        // Escaped so a stray closing tag in a description cannot break out.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <li className="shrink-0">
            <Link href="/" className="transition-colors hover:text-brand-strong">{t("home")}</Link>
          </li>
          <li aria-hidden className="shrink-0">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </li>
          <li className="shrink-0">
            <Link href="/vozila" className="transition-colors hover:text-brand-strong">{t("vehicles")}</Link>
          </li>
          <li aria-hidden className="shrink-0">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </li>
          <li aria-current="page" className="min-w-0 truncate font-medium text-foreground">{car.title}</li>
        </ol>
      </nav>

      <CarDetail
        car={car}
        similar={similar}
        locations={locations.map((l) => ({ id: l.id, name: l.name, slug: l.slug }))}
        extras={extras}
        busy={busy}
        locale={params.locale}
      />
    </div>
  );
}
