import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site-config";

export type Phone = { label: string; value: string; href: string };

export type Company = {
  name: string;
  email: string;
  phones: Phone[];
  whatsapp: string;
  hours: string;
  address: string | null;
  taxId: string | null;
  map: { lat: number | null; lng: number | null; link: string | null };
  rating: { score: number | null; count: number | null };
  socials: { facebook: string | null; instagram: string | null };
  seasonalPricing: boolean;
};

/** Builds a dialable tel: value; the trunk "0" in brackets must be dropped. */
export function telHref(phone: string): string {
  const digits = String(phone ?? "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\d+]/g, "");
  return digits;
}

/** The values shipped with the site, used until the owner saves his own. */
export const COMPANY_FALLBACK: Company = {
  name: SITE.name,
  email: SITE.email,
  phones: SITE.phones.map((p) => ({ ...p })),
  whatsapp: SITE.whatsapp,
  hours: SITE.hours,
  address: null,
  taxId: null,
  map: { lat: SITE.map.lat, lng: SITE.map.lng, link: SITE.map.link },
  rating: { score: SITE.rating.score, count: SITE.rating.count },
  socials: {
    facebook: SITE.socials.facebook,
    instagram: SITE.socials.instagram,
  },
  seasonalPricing: false,
};

export const getCompany = unstable_cache(
  async (): Promise<Company> => {
    try {
      const row = await prisma.companyInfo.findUnique({ where: { id: "main" } });
      if (!row) return COMPANY_FALLBACK;

      const extra = row.phone2 || row.phone3
        ? [
            ...(row.phone2 ? [{ label: row.phone2Label, value: row.phone2 }] : []),
            ...(row.phone3 ? [{ label: row.phone3Label, value: row.phone3 }] : []),
          ]
        : COMPANY_FALLBACK.phones
            .slice(1)
            .filter((p) => p.value !== row.phone1)
            .map(({ label, value }) => ({ label, value }));

      const phones: Phone[] = [
        { label: row.phone1Label, value: row.phone1 },
        ...extra,
      ].map((p) => ({ ...p, href: `tel:${telHref(p.value)}` }));

      return {
        name: row.name,
        email: row.email,
        phones,
        whatsapp: row.whatsapp,
        hours: row.hours,
        address: row.address,
        taxId: row.taxId,
        map: { lat: row.mapLat, lng: row.mapLng, link: row.mapLink },
        rating: { score: row.ratingScore, count: row.ratingCount },
        socials: { facebook: row.facebook, instagram: row.instagram },
        seasonalPricing: row.seasonalPricing,
      };
    } catch {
      // A missing table must never take the whole site down.
      return COMPANY_FALLBACK;
    }
  },
  ["company-info"],
  { revalidate: 300, tags: ["company"] },
);

export function effectivePrice(
  car: { pricePerDay?: unknown; seasonalPrice?: unknown },
  seasonalActive: boolean,
): number | null {
  const regular =
    car.pricePerDay === null || car.pricePerDay === undefined
      ? null
      : Number(car.pricePerDay);
  const seasonal =
    car.seasonalPrice === null || car.seasonalPrice === undefined
      ? null
      : Number(car.seasonalPrice);

  if (seasonalActive && seasonal != null && Number.isFinite(seasonal)) {
    return seasonal;
  }
  return regular != null && Number.isFinite(regular) ? regular : null;
}
