import type { Metadata } from "next";
import ReactDOM from "react-dom";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getCompany } from "@/lib/company";
import { getGooglePlace } from "@/lib/google-reviews";
import { getActiveLocations, getBrowseCars } from "@/lib/fleet-data";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { FeaturedFleet } from "@/components/home/FeaturedFleet";
import { Reviews, type ReviewsData } from "@/components/home/Reviews";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Services } from "@/components/home/Services";
import { WeddingCarsSection } from "@/components/home/WeddingCarsSection";
import { GuidesTeaser } from "@/components/home/GuidesTeaser";
import { Faq } from "@/components/home/Faq";
import { getGuides } from "@/lib/guides";
import { CtaBand } from "@/components/home/CtaBand";
import { ReservationSearchForm } from "@/components/reservation/ReservationSearchForm";

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

const PREMIUM = ["LUXURY", "LIMUZINA"];

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

  const [locations, cars, google, company] = await Promise.all([
    getActiveLocations(),
    getBrowseCars(),
    getGooglePlace(locale),
    getCompany(),
  ]);

  const withImage = cars.filter((c) => c.images.length > 0);
  const premium =
    withImage.find((c) => c.isFeatured && c.categories.some((k) => PREMIUM.includes(k))) ??
    withImage.find((c) => c.categories.some((k) => PREMIUM.includes(k))) ??
    withImage[0];

  const reviews: ReviewsData = {
    score: google?.rating ?? company.rating.score ?? 0,
    count: google?.count ?? company.rating.count ?? 0,
    url: company.map.link ?? "#",
    reviews: (google?.reviews ?? []).map((r) => ({
      author: r.author,
      rating: r.rating,
      text: r.text,
      time: r.when,
      url: r.authorUrl ?? undefined,
    })),
  };

  return (
    <>
      <Hero />

      <section
        id="rezervacija"
        className="relative z-10 mx-auto -mt-20 w-full max-w-6xl scroll-mt-24 px-4 sm:-mt-24 sm:px-6"
      >
        <ReservationSearchForm locations={locations} />
      </section>

      <Features />

      <FeaturedFleet cars={cars} total={cars.length} />

      <HowItWorks />

      {reviews.score > 0 && <Reviews data={reviews} />}

      <Services
        images={[premium?.images[0] ?? "/fleet-premium.webp", "/fleet-aerial.webp"]}
        locations={locations}
      />

      <WeddingCarsSection />

      <GuidesTeaser guides={getGuides(locale)} />

      <Faq />

      <CtaBand />
    </>
  );
}
