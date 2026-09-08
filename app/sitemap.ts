import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { getAllCarSlugs } from "@/lib/car-detail";

// Public, indexable pages (locale-less). /admin and /api are intentionally
// excluded (also blocked in robots).
const PATHS = [
  "",
  "/vozila",
  "/o-nama",
  "/poslovna-ponuda",
  "/uvjeti-najma",
  "/kontakt",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PATHS) {
    // hreflang alternates shared by both locale variants of this page.
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = `${SITE_URL}/${l}${path}`;

    for (const l of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${l}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: { languages },
      });
    }
  }

  /*
   * One entry per vehicle, in both languages.
   *
   * These are the pages that can rank for a model name, which is the whole
   * point of having them; leaving them out of the sitemap would waste the
   * work. A failure here must not take the sitemap down, so it falls back to
   * the static pages alone.
   */
  const cars = await getAllCarSlugs().catch(() => []);
  for (const car of cars) {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) {
      languages[l] = `${SITE_URL}/${l}/vozila/${car.slug}`;
    }
    for (const l of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${l}/vozila/${car.slug}`,
        lastModified: car.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
