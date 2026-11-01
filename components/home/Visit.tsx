import { Clock3, MapPin, Navigation, Phone, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Company } from "@/lib/company";
import { PillLink } from "@/components/ui/PillLink";
import { Heading } from "./Heading";
import { intlLocale } from "@/i18n/routing";

export function Visit({ company, address, locale }: { company: Company; address: string; locale: string }) {
  const t = useTranslations("Visit");
  const score = (company.rating.score ?? 5).toLocaleString(intlLocale(locale), { minimumFractionDigits: 1 });
  const count = company.rating.count ?? 0;
  const { lat, lng } = company.map;
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=16&hl=${locale}&output=embed`;
  const mapLink = company.map.link ?? `https://www.google.com/maps?q=${lat},${lng}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} />

          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="font-display text-4xl font-bold tracking-tight text-foreground">{score}</span>
            <span>
              <span className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{t("reviews", { count })}</span>
            </span>
          </a>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-start gap-3 text-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
              {address}
            </li>
            <li className="flex items-center gap-3 text-foreground">
              <Clock3 className="h-4 w-4 shrink-0 text-brand-strong" />
              {company.hours}
            </li>
            {company.phones.map((p) => (
              <li key={p.value}>
                <a href={p.href} className="flex items-center gap-3 text-foreground transition-colors hover:text-brand-strong">
                  <Phone className="h-4 w-4 shrink-0 text-brand-strong" />
                  {p.value}
                </a>
              </li>
            ))}
          </ul>

          <PillLink href={directions} className="mt-8" icon={<Navigation className="h-4 w-4" />}>
            {t("directions")}
          </PillLink>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-surface-muted ring-1 ring-border lg:aspect-auto lg:h-[480px]">
          <iframe
            src={mapSrc}
            title={`${company.name}, ${address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full grayscale-[20%]"
          />
        </div>
      </div>
    </section>
  );
}
