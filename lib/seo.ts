import type { Metadata } from "next";
import { SITE } from "@/lib/site-config";
import { routing } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE.domain}`;

const OG_LOCALE: Record<string, string> = { hr: "hr_HR", en: "en_US" };

/**
 * Canonical URL + hreflang alternates for a page.
 * `path` is the locale-less pathname, e.g. "/vozila" (use "/" for home).
 */
export function buildAlternates(locale: string, path: string) {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `${SITE_URL}/${l}${clean}`;
  // x-default points search engines at the default-locale version.
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${clean}`;
  return { canonical: `${SITE_URL}/${locale}${clean}`, languages };
}

/**
 * Per-page metadata helper. Keeps title/description, canonical, hreflang and
 * Open Graph consistent across every page. The social image is inherited from
 * the root layout, so it isn't repeated here.
 */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
  return {
    title: { absolute: SITE.name },
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title,
      description,
      locale: OG_LOCALE[locale] ?? "hr_HR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
