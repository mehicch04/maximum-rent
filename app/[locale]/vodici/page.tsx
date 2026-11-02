import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CtaBand } from "@/components/home/CtaBand";
import { PageHeader } from "@/components/layout/PageHeader";
import { GuideCard } from "@/components/guides/GuideCard";
import { buildPageMetadata } from "@/lib/seo";
import { getGuides } from "@/lib/guides";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  const t = await getTranslations({ locale, namespace: "Guides" });
  return buildPageMetadata({
    locale,
    path: "/vodici",
    description: tSeo("guides.description"),
    tab: t("eyebrow"),
  });
}

export default async function GuidesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations("Guides");
  const guides = getGuides(locale);

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("pageTitle")} lead={t("pageLead")} image="/wed-4.webp" position="object-center" />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <li key={g.slug}>
              <GuideCard guide={g} level={2} readLabel={t("read")} minutesLabel={t("minutes", { n: g.minutes })} />
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
