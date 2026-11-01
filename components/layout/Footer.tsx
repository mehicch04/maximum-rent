import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Clock3, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/site-config";
import type { Company } from "@/lib/company";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

type Props = {
  company: Company;
  locations: { name: string; street: string; city: string }[];
};

export function Footer({ company, locations }: Props) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const year = new Date().getFullYear();
  const social = "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/75 ring-1 ring-white/10 transition-colors hover:bg-brand hover:text-white hover:ring-brand";
  const label = "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40";
  const phone = company.phones[0];
  const socials = (
    <div className="flex shrink-0 gap-2">
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
    </div>
  );

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,6,19,0.22),transparent)]" />

      <div className="relative px-4 pb-8 pt-14 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Image src="/logo-dark.png" alt={company.name} width={800} height={239} className="h-10 w-auto" />
          <Link
            href="/vozila"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand pl-4 pr-1.5 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(227,6,19,0.9)]"
          >
            {nav("book")}
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-white/60">{t("tagline")}</p>

        <div className="mt-7 grid grid-cols-2 gap-2.5">
          {phone && (
            <a href={phone.href} className="flex flex-col gap-3 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10 transition-colors active:bg-white/10">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/20 text-brand-400">
                <Phone className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-white/50">{nav("call")}</span>
                <span className="block whitespace-nowrap text-[13px] font-semibold text-white">{phone.value}</span>
              </span>
            </a>
          )}
          <a
            href={`https://wa.me/${company.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-3 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10 transition-colors active:bg-white/10"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">
              <WhatsAppIcon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-white/50">WhatsApp</span>
              <span className="block text-[13px] font-semibold text-white">{t("chat")}</span>
            </span>
          </a>
        </div>

        <ul className="mt-2.5 divide-y divide-white/10 rounded-2xl bg-white/[0.03] text-sm ring-1 ring-white/10">
          {company.phones.slice(1).map((p) => (
            <li key={p.value}>
              <a href={p.href} className="flex items-center gap-3 px-4 py-3.5 text-white/75">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                <span className="flex-1">{p.value}</span>
                <span className="text-[11px] uppercase tracking-[0.12em] text-white/35">{p.label}</span>
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${company.email}`} className="flex items-center gap-3 px-4 py-3.5 text-white/75">
              <Mail className="h-4 w-4 shrink-0 text-brand-400" />
              <span className="truncate">{company.email}</span>
            </a>
          </li>
          <li className="flex items-center gap-3 px-4 py-3.5 text-white/75">
            <Clock3 className="h-4 w-4 shrink-0 text-brand-400" />
            <span className="flex-1">{company.hours}</span>
          </li>
        </ul>

        <p className={`mt-9 ${label}`}>{t("navTitle")}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex h-10 items-center rounded-full bg-white/[0.05] px-4 text-sm text-white/80 ring-1 ring-white/10 transition-colors active:bg-white/10">
                {nav(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        <p className={`mt-9 ${label}`}>{t("locations")}</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {locations.map((loc) => (
            <li key={loc.name} className="rounded-2xl bg-white/[0.03] p-3.5 ring-1 ring-white/10">
              <MapPin className="h-4 w-4 text-brand-400" />
              <span className="mt-2 block text-[13px] font-medium leading-snug text-white/90">{loc.name}</span>
              <span className="mt-0.5 block text-xs leading-snug text-white/45">{loc.street}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className={label}>{t("follow")}</p>
          {socials}
        </div>
      </div>

      <div className="relative mx-auto hidden max-w-6xl gap-12 px-6 py-16 md:grid md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.3fr]">
        <div>
          <Image src="/logo-dark.png" alt={company.name} width={800} height={239} className="h-11 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">{t("tagline")}</p>
          <div className="mt-6">{socials}</div>
        </div>

        <div>
          <p className={label}>{t("navTitle")}</p>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 transition-colors hover:text-white">
                  {nav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={label}>{t("contact")}</p>
          <ul className="mt-4 grid gap-3 text-sm">
            {company.phones.map((p) => (
              <li key={p.value}>
                <a href={p.href} className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                  {p.value}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                {company.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-white/75">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">{t("hours")}</span>
                {company.hours}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <p className={label}>{t("locations")}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {locations.map((loc) => (
              <li key={loc.name} className="flex gap-2.5 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span className="text-white/50">
                  <span className="block font-medium text-white/90">{loc.name}</span>
                  {loc.street}, {loc.city}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-white/45 sm:flex-row sm:px-6 sm:text-left">
          <span>
            © {year} {company.name}. {t("rights")}
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
    </footer>
  );
}
