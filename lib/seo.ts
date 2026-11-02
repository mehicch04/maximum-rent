import type { Metadata } from "next";
import { SITE } from "@/lib/site-config";
import { routing } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE.domain}`;

export const PUBLIC_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : SITE_URL;

export const OG_LOCALE: Record<string, string> = { hr: "hr_HR", en: "en_US", de: "de_DE", es: "es_ES" };

const OG_TAGLINE: Record<string, string> = {
  hr: "Najam vozila u Hercegovini",
  en: "Car rental in Herzegovina",
  de: "Autovermietung in der Herzegowina",
  es: "Alquiler de coches en Herzegovina",
};

export const OG_DESCRIPTION: Record<string, string> = {
  hr: "Od gradskih automobila do luksuznih limuzina. Preuzimanje na 6 lokacija, uključujući Zračnu luku Mostar.",
  en: "From city cars to luxury sedans. Pickup at 6 locations, including Mostar Airport.",
  de: "Vom Stadtauto bis zur Luxuslimousine. Abholung an 6 Standorten, auch am Flughafen Mostar.",
  es: "Desde coches urbanos hasta berlinas de lujo. Recogida en 6 ubicaciones, incluido el aeropuerto de Mostar.",
};

export function ogImage(locale: string) {
  const l = locale in OG_TAGLINE ? locale : "hr";
  return {
    url: `${PUBLIC_URL}/og/${l}.jpg`,
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: `${SITE.name}, ${OG_TAGLINE[l]}`,
  };
}

export function ogTitle(locale: string, tab?: string) {
  return tab ? `${tab} | ${SITE.name}` : `${SITE.name} | ${OG_TAGLINE[locale] ?? OG_TAGLINE.hr}`;
}

function buildAlternates(locale: string, path: string) {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `${SITE_URL}/${l}${clean}`;
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${clean}`;
  return { canonical: `${SITE_URL}/${locale}${clean}`, languages };
}

export function buildPageMetadata({
  locale,
  path,
  description,
  tab,
}: {
  locale: string;
  path: string;
  description: string;
  tab?: string;
}): Metadata {
  const url = `${PUBLIC_URL}/${locale}${path === "/" ? "" : path}`;
  const image = ogImage(locale);
  const og = ogTitle(locale, tab);
  const share = path === "/" ? OG_DESCRIPTION[locale] ?? description : description;
  return {
    title: { absolute: og },
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title: og,
      description: share,
      locale: OG_LOCALE[locale] ?? "hr_HR",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: og,
      description: share,
      images: [image],
    },
  };
}
