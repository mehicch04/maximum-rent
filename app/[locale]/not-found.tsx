import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, BookOpen, Briefcase, CarFront, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/site-config";
import { getGuides } from "@/lib/guides";
import { getBrowseCars } from "@/lib/fleet-data";
import { formatPrice } from "@/lib/currency";
import { CarCard } from "@/components/fleet/CarCard";
import { NotFoundSearch, type SearchItem } from "@/components/notfound/NotFoundSearch";

const QUICK = [
  { href: "/vozila", key: "vehicles", icon: CarFront },
  { href: "/poslovna-ponuda", key: "business", icon: Briefcase },
  { href: "/vodici", key: "guides", icon: BookOpen },
  { href: "/kontakt", key: "contact", icon: Phone },
] as const;

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const [t, nav, tSeo, cars] = await Promise.all([
    getTranslations("NotFound"),
    getTranslations("Nav"),
    getTranslations("Seo"),
    getBrowseCars().catch(() => []),
  ]);

  const items: SearchItem[] = [
    ...NAV_LINKS.map((l) => ({ kind: "page" as const, title: nav(l.key), href: l.href })),
    { kind: "page", title: tSeo("privacy.title"), href: "/privatnost" },
    ...getGuides(locale).map((g) => ({ kind: "guide" as const, title: g.title, href: `/vodici/${g.slug}` })),
    ...cars.map((c) => ({
      kind: "car" as const,
      title: c.title,
      href: `/vozila/${c.slug}`,
      sub: c.pricePerDay != null ? formatPrice(c.pricePerDay, locale === "hr" ? "BAM" : "EUR") : undefined,
    })),
  ];
  const popular = [...cars].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 3);

  return (
    <>
      <section className="px-3 pt-3 sm:px-4">
        <div className="relative isolate overflow-hidden rounded-[28px] bg-ink">
          <Image src="/fleet-aerial.webp" alt="" aria-hidden fill priority sizes="100vw" className="-z-10 object-cover opacity-35" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/75 to-black/40" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 -z-10 h-[360px] w-[520px] rounded-full bg-brand/25 blur-[120px]" />
          <p
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-[-2%] -z-10 select-none font-display text-[42vw] font-bold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.12)] sm:text-[30vw] lg:text-[22rem]"
          >
            404
          </p>
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 text-white sm:px-6 sm:pb-24 sm:pt-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {t("eyebrow")}
            </span>
            <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-[3.4rem]">{t("title")}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{t("lead")}</p>
            <div className="relative z-10 mt-8">
              <NotFoundSearch
                items={items}
                placeholder={t("search")}
                empty={t("empty")}
                clear={t("clear")}
                kinds={{ page: t("kindPage"), guide: t("kindGuide"), car: t("kindCar") }}
              />
            </div>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              {t("home")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("links")}</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK.map(({ href, key, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full items-center gap-3 rounded-[22px] bg-surface p-4 ring-1 ring-border transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(227,6,19,0.35)] hover:ring-brand/30 sm:p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-strong transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 truncate font-display text-[15px] font-bold text-foreground">{nav(key)}</span>
                <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-strong sm:block" />
              </Link>
            </li>
          ))}
        </ul>

        {popular.length > 0 && (
          <>
            <p className="mt-14 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t("popular")}</p>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((c) => (
                <li key={c.id}>
                  <CarCard car={c} imageSizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 31vw" />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
