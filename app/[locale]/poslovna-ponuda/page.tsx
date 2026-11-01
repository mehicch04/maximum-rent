import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeftRight, ArrowUpRight, ClipboardCheck, Disc3, ListChecks, Mail, Phone, ShieldCheck, Shuffle, Wand2, Wrench } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { getCompany } from "@/lib/company";
import { Band } from "@/components/ui/Band";
import { PillLink } from "@/components/ui/PillLink";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { PageHeader } from "@/components/layout/PageHeader";
import { Heading } from "@/components/home/Heading";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { CountStats, type Stat } from "@/components/about/CountStats";
import { LeaseCompare } from "@/components/business/LeaseCompare";
import { intlLocale } from "@/i18n/routing";

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
  setRequestLocale(locale);
  const [company, t] = await Promise.all([getCompany(), getTranslations("Business")]);
  const services = t.raw("services") as string[];
  const rows = t.raw("compareRows") as string[];
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t("waText"))}`;
  const nf = intlLocale(locale);

  const stats: Stat[] = [
    { icon: "car", to: 3, label: t("avgAgeLabel") },
    { icon: "days", to: 30, label: t("minDaysLabel") },
    { icon: "wrench", to: services.length, label: t("servicesCountLabel") },
    { icon: "headset", to: 24, fixed: "24/7", label: t("assistLabel") },
  ];

  const why = [
    { icon: Shuffle, title: t("flexTitle"), body: [t("flexP1"), t("flexP2")] },
    { icon: ListChecks, title: t("simpleTitle"), body: [t("simpleP1"), t("simpleP2")] },
  ];

  const contacts = [
    { icon: Mail, label: company.email, href: `mailto:${company.email}` },
    ...company.phones.map((p) => ({ icon: Phone, label: p.value, href: p.href })),
  ];

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} image="/wed-3.webp" position="object-center">
        <div className="mt-8 flex flex-wrap gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:200ms]">
          <PillLink href="#ponuda">{t("headerCta")}</PillLink>
          <PillLink href={wa} variant="light" icon={<WhatsAppIcon className="h-4 w-4" />}>
            WhatsApp
          </PillLink>
        </div>
      </PageHeader>

      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:-mt-16 sm:px-6">
        <CountStats stats={stats} locale={nf} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Heading eyebrow={t("whyEyebrow")} title={t("whyTitle")} accent={t("whyAccent")} />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {why.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              data-spot
              className="group rounded-[28px] bg-surface p-6 ring-1 ring-border transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(227,6,19,0.4)] sm:p-8"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-strong transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
              <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
                {body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Band>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Heading eyebrow={t("servicesEyebrow")} title={t("servicesTitle")} subtitle={t("servicesSubtitle")} tone="dark" />
          <ul className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {services.map((name, i) => {
              const Icon = SERVICE_ICONS[i] ?? Wrench;
              return (
                <li
                  key={name}
                  className="group flex flex-col gap-5 rounded-[22px] bg-white/[0.04] p-5 ring-1 ring-white/10 transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-white/[0.07] sm:flex-row sm:items-center sm:p-6"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/20 text-brand-300 transition-[background-color,color,transform] duration-300 group-hover:rotate-[-8deg] group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-[15px] font-bold text-white">{name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Band>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <Heading eyebrow={t("compareEyebrow")} title={t("compareHeading")} accent={t("compareAccent")} subtitle={t("compareHint")} />
        </div>
        <div className="mt-10">
          <LeaseCompare rows={rows} options={[t("compareCol1"), t("compareCol2")]} labels={[t("compareYes"), t("compareNo")]} />
        </div>
      </section>

      <section id="ponuda" className="scroll-mt-24 mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Heading eyebrow={t("formEyebrow")} title={t("ctaTitle")} subtitle={t("ctaText")} />
            <ul className="mt-8 grid gap-2">
              {contacts.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group flex items-center gap-3.5 rounded-2xl bg-surface p-3.5 ring-1 ring-border transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-brand/30"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-strong transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{label}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-strong" />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 rounded-2xl bg-[#25D366] p-3.5 text-ink transition-[filter,transform] duration-300 hover:-translate-y-0.5 hover:brightness-105"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/30">
                    <WhatsAppIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex-1 text-sm font-semibold">WhatsApp</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            </ul>
          </div>
          <InquiryForm type="business" />
        </div>
      </section>
    </>
  );
}
