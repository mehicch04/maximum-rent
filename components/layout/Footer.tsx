import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatHours } from "@/lib/hours";
import { ArrowRight, ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/site-config";
import type { Company } from "@/lib/company";
import { ConsentLink } from "@/components/consent/CookieConsent";
import { FooterWordmark } from "./FooterWordmark";

type Props = {
  company: Company;
  locations: { name: string; street: string; city: string }[];
};

export function Footer({ company, locations }: Props) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const phone = company.phones[0];
  const head = "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40";
  const col =
    "group block min-w-0 border-t border-white/10 py-6 first:border-t-0 sm:pr-6 sm:[&:nth-child(2)]:border-t-0 lg:border-l lg:border-t-0 lg:px-7 lg:py-7 lg:first:border-l-0 lg:first:pl-0";
  const label = "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40";
  const value = "mt-3 block truncate text-lg font-semibold text-white transition-colors duration-200 group-hover:text-brand-400";
  const note = "mt-1 block text-[13px] text-white/45";
  const handle = company.socials.instagram?.match(/instagram\.com\/([^/?#]+)/)?.[1];
  const socials = [
    { href: company.socials.facebook, name: "Facebook" },
    { href: company.socials.instagram, name: "Instagram" },
  ].filter((s): s is { href: string; name: string } => Boolean(s.href));

  return (
    <footer className="site-footer mt-24 px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute -bottom-48 right-[-10%] -z-10 h-96 w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.14),transparent)]" />

        <div className="mx-auto max-w-6xl px-5 pt-12 sm:px-6 sm:pt-14">
          <div className="grid gap-8 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12 lg:pb-11">
            <div>
              <Image src="/logo-dark.png" alt={company.name} width={800} height={239} className="h-10 w-auto" />
              <h2 className="mt-7 max-w-[780px] text-balance text-[34px] font-bold leading-[1.05] tracking-[-0.03em] sm:text-[44px] lg:text-[54px] lg:leading-[1.02]">
                {t.rich("headline", { em: (c) => <span className="text-brand-400">{c}</span> })}
              </h2>
            </div>
            <Link
              href="/vozila"
              className="inline-flex h-12 items-center gap-2.5 self-start rounded-[10px] bg-brand px-[22px] text-[14.5px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(227,6,19,0.9)] transition-[transform,background-color] duration-200 hover:bg-brand-700 active:scale-[0.98] lg:self-end"
            >
              {t("book")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_1fr]">
            {phone && (
              <a href={phone.href} className={col}>
                <span className={label}>
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                  {t("phone")}
                </span>
                <span className={`${value} tabular-nums`}>{phone.value.replace("(0) ", "")}</span>
                <span className={note}>{formatHours(company.hours, locale)}</span>
              </a>
            )}
            <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener noreferrer" className={col}>
              <span className={label}>
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                WhatsApp
              </span>
              <span className={value}>{t("chat")}</span>
              <span className={note}>{t("chatNote")}</span>
            </a>
            <a href={`mailto:${company.email}`} className={col}>
              <span className={label}>
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" />
                {t("email")}
              </span>
              <span className={value}>{company.email}</span>
              <span className={note}>{t("emailNote")}</span>
            </a>
            {socials.length > 0 && (
              <div className={col}>
                <span className={label}>{t("follow")}</span>
                <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-base font-semibold text-white transition-colors duration-200 hover:text-brand-400"
                    >
                      {s.name}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </span>
                {handle && <span className={note}>@{handle}</span>}
              </div>
            )}
          </div>

          <div className="grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-[0.8fr_1fr_1.6fr] lg:gap-12">
            <nav aria-label={t("navTitle")}>
              <p className={head}>{t("navTitle")}</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group relative inline-flex items-center text-white/70 transition-[color,transform] duration-300 hover:translate-x-3 hover:text-white">
                      <span aria-hidden className="absolute -left-3 top-1/2 h-px w-0 bg-brand transition-all duration-300 group-hover:w-2" />
                      {nav(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className={head}>{t("contact")}</p>
              <ul className="mt-4 grid gap-2 text-sm">
                {company.phones.map((p) => (
                  <li key={p.value}>
                    <a href={p.href} className="flex items-center gap-3 text-white/80 transition-colors hover:text-white">
                      <span className="inline-flex h-6 w-10 shrink-0 items-center justify-center rounded-md bg-white/[0.07] text-[10px] font-semibold uppercase tracking-[0.1em] text-white/55 ring-1 ring-white/10">
                        {p.label}
                      </span>
                      <span className="tabular-nums">{p.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-white/10">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span className="text-sm">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">{t("hours")}</span>
                  <span className="mt-0.5 block font-medium text-white/85">{formatHours(company.hours, locale)}</span>
                </span>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <p className={head}>{t("locations")}</p>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {locations.map((loc) => (
                  <li key={loc.name} className="flex gap-2.5 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.06]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium leading-snug text-white/90">{loc.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-white/45">{loc.street}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <FooterWordmark />

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 text-center text-xs text-white/45 md:flex-row md:px-6 md:text-left">
            <span>
              © {year} {company.name}. {t("rights")}
            </span>
            <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link href="/privatnost" className="transition-colors hover:text-white">
                {t("privacy")}
              </Link>
              <ConsentLink label={t("cookies")} className="transition-colors hover:text-white" />
            </span>
            <span>
              Powered and designed by{" "}
              <a
                href="https://mehiccdev.com"
                target="_blank"
                rel="noopener"
                className="font-semibold text-brand-400 underline decoration-brand/40 decoration-1 underline-offset-4 transition-colors hover:text-white hover:decoration-brand"
              >
                mehiccdev
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
