import { formatHours } from "@/lib/hours";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/company";
import { getActiveLocations } from "@/lib/fleet-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { Heading } from "@/components/home/Heading";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { ContactCards, type ContactCard } from "@/components/contact/ContactCards";
import { ChatTeaser } from "@/components/contact/ChatTeaser";
import { LocationMap, type MapSpot } from "@/components/contact/LocationMap";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  return buildPageMetadata({
    locale,
    path: "/kontakt",
    description: tSeo("contact.description"),
    tab: tNav("contact"),
  });
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const [company, locations, t] = await Promise.all([
    getCompany(),
    getActiveLocations().catch(() => []),
    getTranslations("Contact"),
  ]);

  const cards: ContactCard[] = [
    { kind: "phone", label: t("callLabel"), lines: company.phones.map((p) => ({ value: p.value, href: p.href, tag: p.label })) },
    { kind: "whatsapp", label: "WhatsApp", value: t("chat"), href: `https://wa.me/${company.whatsapp}` },
    { kind: "email", label: t("emailLabel"), value: company.email, href: `mailto:${company.email}`, copy: company.email },
    { kind: "hours", label: t("hoursLabel"), value: formatHours(company.hours, locale) },
  ];

  const office = company.map.lat != null && company.map.lng != null ? `${company.map.lat},${company.map.lng}` : null;
  const spots: MapSpot[] = locations.map((l, i) => {
    const query = i === 0 && office ? office : /\d/.test(l.street) ? `${l.street}, ${l.city}` : `${l.name}, ${l.city}`;
    return {
      slug: l.slug,
      name: l.name,
      street: [l.street, l.city].filter(Boolean).join(", "),
      query,
      link: i === 0 && company.map.link ? company.map.link : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    };
  });

  return (
    <>
      <PageHeader eyebrow={company.name} title={t("title")} lead={t("lead")} />

      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:-mt-16 sm:px-6">
        <ContactCards cards={cards} copyLabel={t("copy")} copiedLabel={t("copied")} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Heading eyebrow={t("infoEyebrow")} title={t("infoTitle")} accent={t("infoAccent")} subtitle={t("infoLead")} />
            <ChatTeaser
              className="mt-8"
              phone={company.whatsapp}
              name={company.name}
              online={t("chatOnline")}
              greeting={t("chatGreeting")}
              chips={t.raw("chatChips") as { label: string; text: string }[]}
              cta={t("whatsapp")}
            />
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.7rem]">{t("formHeading")}</h2>
            <p className="mb-6 mt-2 text-muted-foreground">{t("formLead")}</p>
            <InquiryForm type="contact" />
          </div>
        </div>
      </section>

      {spots.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
          <Heading eyebrow={t("mapEyebrow")} title={t("mapHeading")} subtitle={t("mapLead")} />
          <div className="mt-8">
            <LocationMap spots={spots} locale={locale} openLabel={t("openMap")} routeLabel={t("route")} />
          </div>
        </section>
      )}
    </>
  );
}
