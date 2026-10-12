import { SITE } from "@/lib/site-config";
import { SITE_URL } from "@/lib/seo";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Only emit real social profiles (the defaults in site-config are placeholders).
function realSocials(): string[] {
  const out: string[] = [];
  for (const url of Object.values(SITE.socials)) {
    try {
      const u = new URL(url);
      // skip bare "facebook.com" / "instagram.com" placeholders (no path)
      if (u.pathname && u.pathname !== "/") out.push(url);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function toJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd({ locale }: { locale: string }) {
  const sameAs = realSocials();
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#business`,
    name: SITE.name,
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/logo.png`,
    telephone: "+38763660444",
    email: SITE.email,
    priceRange: "€€",
    currenciesAccepted: "BAM, EUR",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Potpolje b.b.",
      addressLocality: "Čitluk",
      postalCode: "88260",
      addressCountry: "BA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.map.lat,
      longitude: SITE.map.lng,
    },
    hasMap: SITE.map.link,
    areaServed: [
      "Mostar",
      "Međugorje",
      "Čitluk",
      "Čapljina",
      "Ljubuški",
      "Herzegovina",
    ].map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAYS,
        opens: "07:30",
        closes: "20:30",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE.rating.score.toString(),
      reviewCount: SITE.rating.count.toString(),
      bestRating: "5",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLd(data) }}
    />
  );
}
