import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { getCarBySlug, getSimilarCars } from "@/lib/car-detail";
import { getActiveLocations } from "@/lib/fleet-data";
import { getActiveExtras } from "@/lib/extras";
import { getBookedExtras } from "@/lib/extras-availability";
import { SITE_URL } from "@/lib/seo";
import { CarDetail } from "@/components/fleet/CarDetail";

export const revalidate = 300;

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car) return { title: { absolute: "Maximum Rent a Car" } };

  const en = params.locale === "en";
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
      languages: {
        hr: `${SITE_URL}/hr/vozila/${car.slug}`,
        en: `${SITE_URL}/en/vozila/${car.slug}`,
      },
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

  const [similar, locations, extras, booked, t] = await Promise.all([
    getSimilarCars(car.slug, car.carClass),
    getActiveLocations(),
    getActiveExtras(),
    getBookedExtras().catch(() => []),
    getTranslations("Fleet"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.title,
    image: car.images ?? [],
    description:
      (params.locale === "en" ? car.descriptionEn : car.descriptionHr) ?? car.title,
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        // Escaped so a stray closing tag in a description cannot break out.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link
        href={`/${params.locale}/vozila`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-strong"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToFleet")}
      </Link>

      <CarDetail
        car={car}
        similar={similar}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        extras={extras}
        bookedExtras={booked}
        locale={params.locale}
      />
    </main>
  );
}
