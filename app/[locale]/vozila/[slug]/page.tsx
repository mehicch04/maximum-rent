import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car) return { title: { absolute: "Maximum Rent a Car" } };

  const en = params.locale !== "hr";
  const description =
    (en ? car.descriptionEn : car.descriptionHr) ??
    (en
      ? `Rent a ${car.title} in Mostar and Međugorje. ${car.passengers} seats, ${car.transmission.toLowerCase()}.`
      : `Iznajmite ${car.title} u Mostaru i Međugorju. ${car.passengers} sjedišta, ${car.transmission.toLowerCase()}.`);

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.title,
    image: car.images ?? [],
    description:
      (params.locale !== "hr" ? car.descriptionEn : car.descriptionHr) ?? car.title,
    brand: { "@type": "Brand", name: car.brand },
    offers: car.pricePerDay
      ? {
          "@type": "Offer",
          price: car.pricePerDay,
          priceCurrency: car.currency ?? "BAM",
          availability: car.isAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/${params.locale}/vozila/${car.slug}`,
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
