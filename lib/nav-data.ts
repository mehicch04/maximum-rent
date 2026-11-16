import { getBrowseCars } from "@/lib/fleet-data";
import { carCategories, type CarCategory } from "@/lib/car-categories";
import { getGuides, type GuideIcon } from "@/lib/guides";

export type NavCategory = { key: CarCategory; count: number; from: number | null; image: string | null };
export type NavGuide = { slug: string; icon: GuideIcon; title: string; sub: string | null; minutes: number };
export type NavData = { total: number; categories: NavCategory[]; guides: NavGuide[] };

const ORDER: CarCategory[] = ["COMPACT", "LIMUZINA", "KARAVAN", "SUV", "COUPE", "CABRIO", "LUXURY", "TRANSPORT", "MINIBUS"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function getNavData(locale: string): Promise<NavData> {
  const cars = await getBrowseCars().catch(() => []);
  const categories = ORDER.map((key) => {
    const list = cars.filter((c) => carCategories(c).includes(key));
    const prices = list.map((c) => c.pricePerDay).filter((p): p is number => p != null && p > 0);
    const pick = list.find((c) => c.isFeatured && c.images?.length) ?? list.find((c) => c.images?.length);
    return { key, count: list.length, from: prices.length ? Math.min(...prices) : null, image: pick?.images[0] ?? null };
  }).filter((c) => c.count > 0);
  const guides = getGuides(locale).map((g) => {
    const i = g.title.indexOf(": ");
    return {
      slug: g.slug,
      icon: g.icon,
      minutes: g.minutes,
      title: i > 0 ? g.title.slice(0, i) : g.title,
      sub: i > 0 ? cap(g.title.slice(i + 2)) : null,
    };
  });
  return { total: cars.length, categories, guides };
}
