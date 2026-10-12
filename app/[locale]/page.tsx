import type { Metadata } from "next";
import ReactDOM from "react-dom";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveExtras } from "@/lib/extras";
import { getBookedExtras } from "@/lib/extras-availability";
import { toCarListItem } from "@/lib/types";
import { getCompany } from "@/lib/company";
import { Hero } from "@/components/home/Hero";
import { WhyChoose } from "@/components/home/WhyChoose";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Locations } from "@/components/home/Locations";
import { Reviews } from "@/components/home/Reviews";
import { BusinessTeaser } from "@/components/home/BusinessTeaser";
import { WeddingCarsSection } from "@/components/home/WeddingCarsSection";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { ReservationSearchForm } from "@/components/reservation/ReservationSearchForm";
import { FleetGrid } from "@/components/fleet/FleetGrid";

export const revalidate = 300;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  return buildPageMetadata({
    locale,
    path: "/",
    title: tSeo("home.title"),
    description: tSeo("home.description"),
  });
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  ReactDOM.preload("/hero-poster.webp", {
    as: "image",
    fetchPriority: "high",
  });

  const t = await getTranslations("Fleet");

  const [locations, featured, extras, bookedExtras] = await Promise.all([
    // street is needed by the Locations section further down the page.
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, street: true, city: true },
    }),
    prisma.car.findMany({
      where: { isAvailable: true, isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
      getActiveExtras(),
    getBookedExtras().catch(() => []),
      getBookedExtras().catch(() => []),
  ]);

  const { seasonalPricing } = await getCompany();
  const cars = featured.map((c) => toCarListItem(c, seasonalPricing));

  return (
    <>
      <Hero />

      <section
        id="rezervacija"
        className="relative z-10 mx-auto -mt-20 w-full max-w-6xl scroll-mt-24 px-4 sm:-mt-24 sm:px-6"
      >
        <ReservationSearchForm locations={locations} />
      </section>

      <WhyChoose />

      <HowItWorks />

      {/* Featured fleet */}
      {cars.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
              <span className="h-px w-7 bg-brand" />
              {t("title")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("subtitle")}
            </h2>
          </div>
          <FleetGrid
            cars={cars}
            showFilters={false}
            locations={locations.map((l) => ({ id: l.id, name: l.name }))}
            imageSizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 20vw"
            extras={extras}
            bookedExtras={bookedExtras}
          />

          <div className="mt-10 flex justify-center">
            <Link
              href="/vozila"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
            >
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <Locations locations={locations} />

      <Reviews />

      <BusinessTeaser />

      <WeddingCarsSection />

      <Faq />

      <FinalCta />
    </>
  );
}
