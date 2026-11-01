import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, Check, Clock3, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { intlLocale, routing } from "@/i18n/routing";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { GUIDE_SLUGS, getGuide, getGuides, type GuideBlock } from "@/lib/guides";
import { getBrowseCars } from "@/lib/fleet-data";
import { getCompany } from "@/lib/company";
import { SimilarCars } from "@/components/fleet/SimilarCars";
import { GuideCard } from "@/components/guides/GuideCard";
import { RoadSign } from "@/components/guides/RoadSign";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import type { CarListItem } from "@/lib/types";

type Props = { params: { locale: string; slug: string } };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => GUIDE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide(params.locale, params.slug);
  if (!g) return {};
  return buildPageMetadata({ locale: params.locale, path: `/vodici/${g.slug}`, title: g.title, description: g.lead, tab: g.title });
}

function Block({ b }: { b: GuideBlock }) {
  switch (b.type) {
    case "h2":
      return <h2 className="pt-6 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{b.text}</h2>;
    case "p":
      return <p className="text-[15.5px] leading-[1.75] text-foreground/85">{b.text}</p>;
    case "ul":
      return (
        <ul className="space-y-3">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3 text-[15.5px] leading-[1.7] text-foreground/85">
              <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{b.head[0]}</th>
                <th className="px-4 py-3 text-right font-medium">{b.head[1]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {b.rows.map(([a, c]) => (
                <tr key={a} className="transition-colors hover:bg-brand/[0.04]">
                  <td className="px-4 py-3 text-foreground/90">{a}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground sm:whitespace-nowrap">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "note":
      return (
        <p className="flex gap-3 rounded-2xl bg-surface-muted p-4 text-sm leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {b.text}
        </p>
      );
  }
}

export default async function GuidePage({ params }: Props) {
  setRequestLocale(params.locale);
  const guide = getGuide(params.locale, params.slug);
  if (!guide) notFound();

  const [t, tFleet, cars, company] = await Promise.all([
    getTranslations("Guides"),
    getTranslations("HomeFleet"),
    getBrowseCars().catch(() => [] as CarListItem[]),
    getCompany(),
  ]);
  const others = getGuides(params.locale).filter((g) => g.slug !== guide.slug);
  const perks = (tFleet.raw("included") as { title: string }[]).slice(0, 2);
  const picked = [...cars.filter((c) => c.isFeatured), ...cars.filter((c) => !c.isFeatured)].slice(0, 3);
  const date = new Intl.DateTimeFormat(intlLocale(params.locale), { day: "numeric", month: "long", year: "numeric" }).format(new Date(guide.updated));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.lead,
    dateModified: guide.updated,
    inLanguage: params.locale,
    mainEntityOfPage: `${SITE_URL}/${params.locale}/vodici/${guide.slug}`,
    publisher: { "@type": "Organization", name: company.name },
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/vodici" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <header className="mt-8 flex max-w-3xl items-start gap-5">
        <RoadSign kind={guide.icon === "fines" ? "speed" : "warning"} className="mt-1 hidden h-16 w-16 shrink-0 sm:block" />
        <div>
          <h1 className="text-balance font-display text-[2rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl">{guide.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{guide.lead}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {t("minutes", { n: guide.minutes })}
            </span>
            <span>{t("updated", { date })}</span>
          </p>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 max-w-3xl space-y-5">
          {guide.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-[24px] bg-ink p-6 text-white">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.45),transparent)]" />
            <p className="relative font-display text-xl font-bold">{t("ctaTitle")}</p>
            <p className="relative mt-2 text-sm leading-relaxed text-white/70">{t("ctaBody")}</p>
            <ul className="relative mt-5 space-y-2 text-sm text-white/80">
              {perks.map((p) => (
                <li key={p.title} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  {p.title}
                </li>
              ))}
            </ul>
            <div className="relative mt-6 grid gap-2">
              <Link
                href="/vozila"
                className="group flex h-12 items-center justify-between rounded-full bg-brand pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.99]"
              >
                {t("ctaButton")}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
              <a
                href={`https://wa.me/${company.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-12 items-center justify-between rounded-full bg-white/[0.07] pl-5 pr-1.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.12] active:scale-[0.99]"
              >
                <span className="inline-flex items-center gap-2">
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  {t("whatsapp")}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-ink transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {picked.length > 0 && <SimilarCars cars={picked} locale={params.locale} title={t("similar")} />}

      {others.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-xl font-bold text-foreground">{t("more")}</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {others.map((g) => (
              <li key={g.slug}>
                <GuideCard guide={g} readLabel={t("read")} minutesLabel={t("minutes", { n: g.minutes })} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
