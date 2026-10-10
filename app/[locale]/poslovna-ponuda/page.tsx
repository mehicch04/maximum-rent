import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Wrench,
  ClipboardCheck,
  ShieldCheck,
  ArrowLeftRight,
  Disc3,
  Wand2,
  Check,
  X,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { getCompany } from "@/lib/company";
import { InquiryForm } from "@/components/forms/InquiryForm";

const SERVICE_ICONS = [Wrench, ClipboardCheck, ShieldCheck, ArrowLeftRight, Disc3, Wand2];

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  return buildPageMetadata({
    locale,
    path: "/poslovna-ponuda",
    title: tSeo("business.title"),
    description: tSeo("business.description"),
    tab: tNav("business"),
  });
}

export default async function BusinessPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const company = await getCompany();
  setRequestLocale(locale);
  const t = await getTranslations("Business");

  const services = t.raw("services") as string[];
  const compareRows = t.raw("compareRows") as string[];
  const whatsappUrl = `https://wa.me/${company.whatsapp}`;

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
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("lead")}</p>
      </header>

      {/* Value: flexibility + simplicity */}
      <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="font-display text-xl font-bold text-foreground">{t("flexTitle")}</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <p>{t("flexP1")}</p>
            <p>{t("flexP2")}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="font-display text-xl font-bold text-foreground">{t("simpleTitle")}</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/90">
            <p>{t("simpleP1")}</p>
            <p>{t("simpleP2")}</p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-muted p-6">
          <span className="font-display text-4xl font-extrabold text-brand">3</span>
          <span className="text-sm font-medium text-foreground">{t("avgAgeLabel")}</span>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-muted p-6">
          <span className="font-display text-4xl font-extrabold text-brand">30</span>
          <span className="text-sm font-medium text-foreground">{t("minDaysLabel")}</span>
        </div>
      </div>

      {/* Included services */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("servicesTitle")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("servicesSubtitle")}</p>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {services.map((name, i) => {
            const Icon = SERVICE_ICONS[i] ?? Check;
            return (
              <div
                key={name}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-foreground">{name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("compareTitle")}
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-x-3 border-b border-border bg-surface-muted/50 px-4 py-3 sm:px-6">
            <span />
            <span className="w-14 text-center text-[10px] font-bold uppercase leading-tight text-brand sm:w-28 sm:text-xs">
              {t("compareCol1")}
            </span>
            <span className="w-14 text-center text-[10px] font-bold uppercase leading-tight text-muted-foreground sm:w-28 sm:text-xs">
              {t("compareCol2")}
            </span>
          </div>
          {compareRows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-border px-4 py-3.5 last:border-0 sm:px-6"
            >
              <span className="pr-2 text-sm leading-snug text-foreground/90">{row}</span>
              <span className="flex w-14 justify-center sm:w-28">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-foreground">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </span>
              <span className="flex w-14 justify-center sm:w-28">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground/60">
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + form */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="lg:pt-2">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("ctaText")}</p>

          <div className="mt-6 space-y-3 text-sm">
            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-3 text-foreground/90 transition-colors hover:text-brand"
            >
              <Mail className="h-4 w-4 text-brand" />
              {company.email}
            </a>
            {company.phones.map((p) => (
              <a
                key={p.value}
                href={p.href}
                className="flex items-center gap-3 text-foreground/90 transition-colors hover:text-brand"
              >
                <Phone className="h-4 w-4 text-brand" />
                {p.value}
              </a>
            ))}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-foreground/90 transition-colors hover:text-brand"
            >
              <MessageCircle className="h-4 w-4 text-brand" />
              WhatsApp
            </a>
          </div>
        </div>

        <InquiryForm type="business" />
      </section>
    </div>
  );
}
