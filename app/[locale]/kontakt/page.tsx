import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { getCompany } from "@/lib/company";
import { getActiveLocations } from "@/lib/fleet-data";
import { InquiryForm } from "@/components/forms/InquiryForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  return buildPageMetadata({
    locale,
    path: "/kontakt",
    title: tSeo("contact.title"),
    description: tSeo("contact.description"),
  });
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const company = await getCompany();
  const locations = await getActiveLocations();
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  const head = locations[0]; // Glavni ured – Čitluk
  const mapSrc = `https://maps.google.com/maps?q=${company.map.lat},${company.map.lng}&z=15&hl=${locale}&output=embed`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
      </header>

      {/* Quick-info strip */}
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Working hours */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Clock className="h-6 w-6" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            {t("hoursLabel")}
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">{company.hours}</p>
        </div>

        {/* Phones */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Phone className="h-6 w-6" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            {t("phonesLabel")}
          </p>
          <div className="mt-2 space-y-1">
            {company.phones.map((p) => (
              <a
                key={p.value}
                href={p.href}
                className="block text-sm text-muted-foreground transition-colors hover:text-brand"
              >
                {p.value}
              </a>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Mail className="h-6 w-6" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            {t("emailLabel")}
          </p>
          <a
            href={`mailto:${company.email}`}
            className="mt-2 block break-all text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            {company.email}
          </a>
        </div>

        {/* Location */}
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <MapPin className="h-6 w-6" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            {t("locationLabel")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {head.street}
            <br />
            {head.city}
          </p>
        </div>
      </div>

      {/* Inquiry form */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {t("formHeading")}
        </h2>
        <p className="mt-2 mb-6 max-w-2xl text-muted-foreground">{t("formLead")}</p>
        <InquiryForm type="contact" />
      </section>

      {/* Interactive map */}
      <div className="mt-14">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <MapPin className="h-6 w-6 text-brand" />
            {t("mapHeading")}
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
      </div>

      {/* All offices */}
      <div className="mt-14">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <MapPin className="h-6 w-6 text-brand" />
          {t("ourOffices")}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <h3 className="font-medium text-foreground">{loc.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{loc.street}</p>
              <p className="text-sm text-muted-foreground">{loc.city}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
