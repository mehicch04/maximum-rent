"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Car, Check, Clock3, Globe, Heart, MapPin, Plane } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCompany } from "@/components/company/CompanyProvider";
import { PillLink } from "@/components/ui/PillLink";
import { Heading } from "./Heading";

type Premium = {
  label: string;
  title: string;
  body: string;
  points: string[];
  badge: string;
  cta: string;
  imageAlt: string;
};
type Item = { title: string; body: string };
type Loc = { id: string; name: string; city: string };

const ICONS = [Car, Heart, Globe, BadgeCheck];
const LINKS = ["/vozila", "#vjencanja", "/uvjeti-najma", "/uvjeti-najma"];
const PREMIUM_LINKS = ["/poslovna-ponuda", "/vozila"];
const ease = [0.22, 1, 0.36, 1] as const;

export function Services({ images, locations }: { images: string[]; locations: Loc[] }) {
  const t = useTranslations("Services");
  const company = useCompany();
  const premium = t.raw("premium") as Premium[];
  const items = t.raw("items") as Item[];
  const wa = `https://wa.me/${company.whatsapp}`;

  return (
    <section id="usluge" className="scroll-mt-24 px-3 py-5 sm:px-4 sm:py-8">
      <div className="rounded-[28px] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <Heading eyebrow={t("eyebrow")} title={t("title")} accent={t("accent")} />
            <PillLink href={wa} variant="dark" className="self-start sm:self-auto">
              {t("cta")}
            </PillLink>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {premium.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease }}
                className="flex min-w-0 flex-col rounded-[24px] bg-surface p-2 ring-1 ring-border"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-ink">
                  {images[i] && (
                    <Image
                      src={images[i]}
                      alt={p.imageAlt}
                      fill
                      sizes="(max-width: 1023px) 94vw, 560px"
                      className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                    />
                  )}
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur-md">
                    {p.label}
                  </span>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    <Clock3 className="h-3.5 w-3.5" />
                    {p.badge}
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-5 pb-5 pt-6 sm:px-6">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{p.body}</p>
                  <ul className="mt-6 grid gap-2.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-sm text-foreground">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-strong">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>

                  {i === 1 && locations.length > 0 && (
                    <div className="mt-6 rounded-2xl bg-surface-muted px-4">
                      <div className="flex items-center gap-2 border-b border-border py-3.5 sm:gap-3">
                        <span className="flex items-center gap-2">
                          <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_8px_16px_-8px_rgba(227,6,19,0.9)] sm:grid">
                            <Plane className="h-4 w-4" />
                          </span>
                          <span className="leading-tight">
                            <span className="block text-[11px] font-semibold tracking-[0.08em] text-brand-strong">OMO</span>
                            <span className="block text-sm font-medium text-foreground">{t("route.from")}</span>
                          </span>
                        </span>
                        <span aria-hidden className="relative h-6 min-w-14 flex-1 sm:mx-1">
                          <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-brand/30" />
                          <span className="absolute -inset-y-1 inset-x-0 overflow-hidden">
                            <span className="absolute inset-0 will-change-transform motion-safe:animate-[route-drive_4.5s_cubic-bezier(0.65,0,0.35,1)_infinite]">
                              <span className="absolute left-0 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-surface text-brand-strong shadow-sm ring-1 ring-border">
                                <Car className="h-3.5 w-3.5" />
                              </span>
                            </span>
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-right leading-tight">
                            <span className="block text-[11px] font-semibold tracking-[0.08em] text-brand-strong">{t("route.toCode")}</span>
                            <span className="block text-sm font-medium text-foreground">{t("route.to")}</span>
                          </span>
                          <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white sm:grid">
                            <MapPin className="h-4 w-4" />
                          </span>
                        </span>
                      </div>
                      <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
                        {locations.map((l) => (
                          <li key={l.id} className="flex items-center gap-2.5 py-2.5 sm:py-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-strong" />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">{l.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">{l.city}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto pt-8">
                    <PillLink href={PREMIUM_LINKS[i] ?? "/vozila"}>{p.cta}</PillLink>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => {
              const Icon = ICONS[i] ?? Car;
              const featured = i === 0;
              const href = LINKS[i] ?? "/vozila";
              const cls = `group flex h-full flex-col rounded-2xl p-6 transition-colors ${
                featured ? "bg-brand text-white hover:bg-brand-700" : "bg-surface-muted text-foreground hover:bg-border/50"
              }`;
              const body = (
                <>
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
                      featured ? "bg-white/15 text-white" : "bg-surface text-brand-strong"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-display text-base font-bold">{item.title}</h3>
                  <p className={`mt-2 flex-1 text-sm leading-relaxed ${featured ? "text-white" : "text-muted-foreground"}`}>
                    {item.body}
                  </p>
                  <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${featured ? "text-white" : "text-brand-strong"}`}>
                    {t("more")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </>
              );
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  {href.startsWith("#") ? (
                    <a href={href} className={cls}>
                      {body}
                    </a>
                  ) : (
                    <Link href={href} className={cls}>
                      {body}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
