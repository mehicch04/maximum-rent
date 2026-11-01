import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ban, Clock3, Mail, MapPinned, ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { PRIVACY } from "@/lib/privacy";
import { getCompany } from "@/lib/company";
import { PageHeader } from "@/components/layout/PageHeader";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { ConsentLink } from "@/components/consent/CookieConsent";

const ICONS = [Ban, Clock3, MapPinned, ShieldCheck];

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tSeo = await getTranslations({ locale, namespace: "Seo" });
  return buildPageMetadata({
    locale,
    path: "/privatnost",
    title: tSeo("privacy.title"),
    description: tSeo("privacy.description"),
    tab: tSeo("privacy.title"),
  });
}

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const c = PRIVACY[(locale in PRIVACY ? locale : "hr") as keyof typeof PRIVACY];
  const company = await getCompany();

  const summary = (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {c.facts.map((f, i) => {
        const Icon = ICONS[i] ?? ShieldCheck;
        return (
          <li
            key={f.l}
            style={{ animationDelay: `${i * 80}ms` }}
            className="group rounded-[22px] bg-surface p-4 shadow-[0_18px_40px_-30px_rgba(17,17,19,0.45)] ring-1 ring-border transition-transform duration-300 hover:-translate-y-1 motion-safe:animate-rise sm:p-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-strong transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <p className="font-display text-xl font-bold text-foreground sm:text-2xl">{f.v}</p>
            </div>
            <p className="mt-2.5 text-xs leading-snug text-muted-foreground sm:text-sm">{f.l}</p>
          </li>
        );
      })}
    </ul>
  );

  const help = (
    <div className="relative overflow-hidden rounded-[22px] bg-ink p-5 text-white">
      <span aria-hidden className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.45),transparent)]" />
      <p className="relative font-display text-base font-bold">{c.helpTitle}</p>
      <p className="relative mt-1.5 text-sm leading-relaxed text-white/60">{c.helpBody}</p>
      <div className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <a
          href={`mailto:${company.email}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Mail className="h-4 w-4" />
          {company.email}
        </a>
        <ConsentLink
          label={c.cookies}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
        />
      </div>
    </div>
  );

  return (
    <>
      <PageHeader eyebrow={c.updated} title={c.heading} lead={c.intro} image="/fleet-aerial.webp" position="object-center" />
      <LegalDoc c={c} summary={summary} help={help} />
    </>
  );
}
