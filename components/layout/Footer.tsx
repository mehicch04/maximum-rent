import Image from "next/image";
import { useTranslations } from "next-intl";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/site-config";
import type { Company } from "@/lib/company";

type Props = {
  company: Company;
  locations: { name: string; street: string; city: string }[];
};

export function Footer({ company, locations }: Props) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface-muted">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1.4fr_0.8fr]">
        {/* Brand + nav */}
        <div className="space-y-4">
          <Image
            src="/logo.png"
            alt="Maximum Rent a Car"
            width={800}
            height={239}
            className="h-11 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.png"
            alt="Maximum Rent a Car"
            width={800}
            height={239}
            className="hidden h-11 w-auto dark:block"
          />
          <p className="max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
          <ul className="flex flex-col gap-1.5 pt-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  {nav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide">{t("contact")}</h3>
          <ul className="space-y-2.5 text-sm">
            {company.phones.map((p) => (
              <li key={p.value}>
                <a
                  href={p.href}
                  className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-brand"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand" />
                  {p.value}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-brand"
              >
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                {company.email}
              </a>
            </li>
          </ul>

          <div className="flex items-start gap-2.5 pt-1 text-sm">
            <Clock className="h-4 w-4 shrink-0 text-brand" />
            <span className="text-muted-foreground">
              <span className="block text-xs font-medium uppercase tracking-wide text-foreground/70">
                {t("hours")}
              </span>
              {company.hours}
            </span>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide">{t("locations")}</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {locations.map((loc) => (
              <li key={loc.name} className="flex gap-2.5 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span className="text-muted-foreground">
                  <span className="block font-medium text-foreground">{loc.name}</span>
                  {loc.street}, {loc.city}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide">{t("follow")}</h3>
          <div className="flex gap-3">
            {company.socials.facebook && (
            <a
              href={company.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground/80 transition-colors hover:border-brand hover:text-brand"
            >
              <Facebook className="h-5 w-5" />
            </a>
            )}
            {company.socials.instagram && (
            <a
              href={company.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground/80 transition-colors hover:border-brand hover:text-brand"
            >
              <Instagram className="h-5 w-5" />
            </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {year} {company.name}. {t("rights")}
          </span>
          <span>
            Powered and designed by{" "}
            <a
              href="https://mehiccdev.com"
              target="_blank"
              rel="noopener"
              className="font-semibold text-brand-strong underline decoration-brand/40 decoration-1 underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand"
            >
              mehiccdev
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
