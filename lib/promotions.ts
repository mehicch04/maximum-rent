import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCompany } from "@/lib/company";

type Lang = "hr" | "en" | "de" | "es";

type Raw = {
  id: string;
  title: Record<Lang, string | null>;
  text: Record<Lang, string | null>;
  badge: string | null;
  image: string | null;
  link: string | null;
  endsAt: string | null;
  car: { slug: string; title: string; image: string | null; price: number | null } | null;
};

export type PromoItem = {
  id: string;
  title: string;
  text: string | null;
  badge: string | null;
  image: string;
  href: string;
  external: boolean;
  endsAt: string | null;
  carTitle: string | null;
  price: number | null;
};

const loadActive = unstable_cache(
  async (): Promise<Raw[]> => {
    const now = new Date();
    const [rows, company] = await Promise.all([
      prisma.promotion.findMany({
        where: {
          isActive: true,
          AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
        },
        include: { car: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
      getCompany(),
    ]);
    return rows.map((p) => {
      const regular = p.car?.pricePerDay != null ? Number(p.car.pricePerDay) : null;
      const seasonal = p.car?.seasonalPrice != null ? Number(p.car.seasonalPrice) : null;
      return {
        id: p.id,
        title: { hr: p.titleHr, en: p.titleEn, de: p.titleDe, es: p.titleEs },
        text: { hr: p.textHr, en: p.textEn, de: p.textDe, es: p.textEs },
        badge: p.badge,
        image: p.image,
        link: p.link,
        endsAt: p.endsAt ? p.endsAt.toISOString() : null,
        car: p.car
          ? {
              slug: p.car.slug,
              title: p.car.title,
              image: p.car.images?.[0] ?? null,
              price: company.seasonalPricing && seasonal != null ? seasonal : regular,
            }
          : null,
      };
    });
  },
  ["promotions-active"],
  { revalidate: 300, tags: ["promotions"] },
);

const pick = (m: Record<Lang, string | null>, l: Lang) => {
  const v = (x: string | null) => (x && x.trim() ? x.trim() : null);
  if (l === "hr") return v(m.hr) ?? v(m.en);
  if (l === "en") return v(m.en) ?? v(m.hr);
  return v(m[l]) ?? v(m.en) ?? v(m.hr);
};

export async function getActivePromotions(locale: string): Promise<PromoItem[]> {
  const l = (["hr", "en", "de", "es"].includes(locale) ? locale : "hr") as Lang;
  let rows: Raw[] = [];
  try {
    rows = await loadActive();
  } catch {
    return [];
  }
  return rows.map((r) => {
    const link = r.link?.trim() || null;
    const external = !!link && /^https?:\/\//i.test(link);
    return {
      id: r.id,
      title: pick(r.title, l) ?? "",
      text: pick(r.text, l),
      badge: r.badge,
      image: r.image ?? r.car?.image ?? "/fleet-premium.webp",
      href: link ?? (r.car ? `/vozila/${r.car.slug}` : "/vozila"),
      external,
      endsAt: r.endsAt,
      carTitle: r.car?.title ?? null,
      price: r.car?.price ?? null,
    };
  });
}
