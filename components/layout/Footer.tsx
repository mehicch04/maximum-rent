import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatHours } from "@/lib/hours";
import { ArrowUpRight, Clock3, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/site-config";
import type { Company } from "@/lib/company";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ConsentLink } from "@/components/consent/CookieConsent";

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
  const tile =
    "group relative flex min-w-0 items-center gap-3 rounded-2xl bg-white/[0.05] p-3.5 ring-1 ring-white/10 transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:ring-white/20 sm:p-4";
  const social =
    "grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white/75 ring-1 ring-white/10 transition-colors hover:bg-brand hover:text-white hover:ring-brand";

  return (
    <footer className="site-footer mt-24 px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-40 -z-10 h-80 w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.28),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 right-[-10%] -z-10 h-96 w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.14),transparent)]" />

        <div className="mx-auto max-w-6xl px-5 pt-12 sm:px-6 sm:pt-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.65fr)] lg:items-end lg:gap-10">
            <div>
              <Image src="/logo-dark.png" alt={company.name} width={800} height={239} className="h-10 w-auto sm:h-11" />
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">{t("tagline")}</p>
              <div className="mt-6 flex items-center gap-2">
                {company.socials.facebook && (
                  <a href={company.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={social}>
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {company.socials.instagram && (
                  <a href={company.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={social}>
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                <Link
                  href="/vozila"
                  className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-brand pl-4 pr-1.5 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(227,6,19,0.9)] transition-colors hover:bg-brand-700 lg:hidden"
                >
                  {nav("book")}
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.3fr)]">
              {phone && (
                <a href={phone.href} className={tile}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-[0_10px_20px_-10px_rgba(227,6,19,0.9)]">
                    <Phone className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">{phone.label}</span>
                    <span className="block truncate text-sm font-semibold">{phone.value.replace("(0) ", "")}</span>
                  </span>
                </a>
              )}
              <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener noreferrer" className={tile}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#25D366] text-ink">
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">WhatsApp</span>
                  <span className="block truncate text-sm font-semibold">{t("chat")}</span>
                </span>
              </a>
              <a href={`mailto:${company.email}`} className={tile}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-ink">
                  <Mail className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">{t("email")}</span>
                  <span className="block truncate text-sm font-semibold">{company.email}</span>
                </span>
              </a>
            </div>
          </div>

          <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-[0.8fr_1fr_1.6fr] lg:gap-12">
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

        <div aria-hidden className="pointer-events-none relative mt-10 select-none overflow-hidden sm:mt-12">
          <p className="translate-y-[18%] whitespace-nowrap text-center font-display text-[16.5vw] font-bold leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.09)] lg:text-[16.5rem]">
            MAXIMUM
          </p>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
        </div>

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
