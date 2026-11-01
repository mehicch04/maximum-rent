import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarCheck, Heart, MapPin, ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { getActiveLocations, getBrowseCars } from "@/lib/fleet-data";
import { getCompany } from "@/lib/company";
import { Band } from "@/components/ui/Band";
import { PillLink } from "@/components/ui/PillLink";
import { PageHeader } from "@/components/layout/PageHeader";
import { Heading } from "@/components/home/Heading";
import { Visit } from "@/components/home/Visit";
import { CtaBand } from "@/components/home/CtaBand";
import { StoryCollage } from "@/components/about/StoryCollage";
import { CountStats, type Stat } from "@/components/about/CountStats";
import { Journey } from "@/components/about/Journey";
import { FleetMarquee } from "@/components/about/FleetMarquee";
import { intlLocale } from "@/i18n/routing";

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
  setRequestLocale(locale);
  const [t, cars, company, locations] = await Promise.all([
    getTranslations("About"),
    getBrowseCars().catch(() => []),
    getCompany(),
    getActiveLocations().catch(() => []),
  ]);
  const nf = intlLocale(locale);
  const score = company.rating.score ?? 5;
  const count = company.rating.count ?? 0;
  const head = locations[0];
  const address = company.address ?? (head ? `${head.street}, ${head.city}` : "");

  const stats: Stat[] = [
    { icon: "users", to: 4532, suffix: "+", label: t("stats.clientsLabel") },
    { icon: "years", to: new Date().getFullYear() - 2009, label: t("stats.yearsLabel") },
    { icon: "car", to: 35, label: t("stats.carsLabel") },
    { icon: "pin", to: 6, label: t("stats.branchesLabel") },
  ];

  const features = [
    { icon: CalendarCheck, title: t("features.f1Title"), text: t("features.f1Text") },
    { icon: MapPin, title: t("features.f2Title"), text: t("features.f2Text") },
    { icon: ShieldCheck, title: t("features.f3Title"), text: t("features.f3Text") },
    { icon: Heart, title: t("features.f4Title"), text: t("features.f4Text") },
  ];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("headerLead")} image="/wed-2.webp" position="object-center" />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <Heading eyebrow={t("storyTitle")} title={t("storyHeadline")} accent={t("storyAccent")} />
            <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-muted-foreground">
              <p className="text-foreground">{t("lead")}</p>
              <p>{t("intro2")}</p>
              <p>{t("storyP1")}</p>
            </div>
          </div>
          <StoryCollage
            main="/wed-1.webp"
            side="/fleet-aerial.webp"
            mainAlt={t("collageMainAlt")}
            sideAlt={t("collageSideAlt")}
            score={score.toLocaleString(nf, { minimumFractionDigits: 1 })}
            reviews={t("reviews", { count })}
            badge={t("features.f1Title")}
          />
        </div>
        <div className="mt-20 sm:mt-24">
          <CountStats stats={stats} locale={nf} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
        <Heading eyebrow={t("journeyEyebrow")} title={t("journeyTitle")} accent={t("journeyAccent")} />
        <div className="mt-12 sm:mt-14">
          <Journey steps={t.raw("journey") as { t: string; d: string }[]} />
        </div>
      </section>

      <Band>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-[28px] lg:aspect-[4/5]">
            <Image
              src="/wed-3.webp"
              alt={t("imageAlt")}
              fill
              sizes="(max-width: 1023px) 100vw, 45vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
          </div>
          <div>
            <Heading eyebrow={t("featuresEyebrow")} title={t("featuresTitle")} accent={t("featuresAccent")} subtitle={t("storyP2")} tone="dark" />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="group rounded-[22px] bg-white/[0.04] p-5 ring-1 ring-white/10 transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-white/[0.07] sm:p-6"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/20 text-brand-300 transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      {cars.length > 3 && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-end sm:px-6">
            <Heading eyebrow={t("fleetEyebrow")} title={t("fleetTitle")} accent={t("fleetAccent")} />
            <PillLink href="/vozila" variant="dark" className="self-start sm:self-auto">
              {t("fleetCta")}
            </PillLink>
          </div>
          <div className="mx-auto mt-10 max-w-[1400px] px-3 sm:px-4">
            <FleetMarquee cars={cars} />
          </div>
        </section>
      )}

      <Visit company={company} address={address} locale={locale} />
      <CtaBand />
    </>
  );
}
