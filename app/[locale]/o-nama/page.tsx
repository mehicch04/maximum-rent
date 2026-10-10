import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CalendarCheck,
  MapPin,
  ShieldCheck,
  Heart,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCompany } from "@/lib/company";
import { getActiveLocations } from "@/lib/fleet-data";
import { AboutStats } from "@/components/about/AboutStats";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  return buildPageMetadata({
    locale,
    path: "/o-nama",
    title: tSeo("about.title"),
    description: tSeo("about.description"),
    tab: tNav("about"),
  });
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const company = await getCompany();
  const locations = await getActiveLocations();
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const years = new Date().getFullYear() - 2009;
  const mapSrc = `https://maps.google.com/maps?q=${company.map.lat},${company.map.lng}&z=15&hl=${locale}&output=embed`;

  const stats = [
    { value: 4532, suffix: "+", label: t("stats.clientsLabel") },
    { value: years, label: t("stats.yearsLabel") },
    { value: 35, label: t("stats.carsLabel") },
    { value: 6, label: t("stats.branchesLabel") },
  ];

  const features = [
    { icon: CalendarCheck, title: t("features.f1Title"), text: t("features.f1Text") },
    { icon: MapPin, title: t("features.f2Title"), text: t("features.f2Text") },
    { icon: ShieldCheck, title: t("features.f3Title"), text: t("features.f3Text") },
    { icon: Heart, title: t("features.f4Title"), text: t("features.f4Text") },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      {/* Hero */}
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-strong">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {t("lead")}
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t("intro2")}
        </p>
      </header>

      {/* Stats */}
      <div className="mt-12">
        <AboutStats items={stats} locale={locale} />
      </div>

      {/* Story + features */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("storyTitle")}
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-base leading-relaxed text-foreground/90">
          <p>{t("storyP1")}</p>
          <p>{t("storyP2")}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-6 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Map + locations */}
      <section className="mt-16">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <MapPin className="h-6 w-6 text-brand" />
            {t("mapTitle")}
          </h2>
          <a
            href={company.map.link ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-700"
          >
            {t("openMap")}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <p className="mb-5 max-w-3xl text-muted-foreground">{t("mapText")}</p>

        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-border shadow-card sm:aspect-[21/9] dark:[filter:brightness(0.92)_contrast(1.05)]">
          <iframe
            src={mapSrc}
            title="Maximum Rent a Car — lokacija"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {locations.map((loc) => (
            <span
              key={loc.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground/80"
            >
              <MapPin className="h-3.5 w-3.5 text-brand" />
              {loc.name}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-3xl border border-border bg-surface-muted p-8 text-center shadow-card sm:p-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("ctaTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("ctaText")}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/vozila"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
          >
            {t("ctaFleet")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            {t("ctaContact")}
          </Link>
        </div>
      </section>
    </div>
  );
}
