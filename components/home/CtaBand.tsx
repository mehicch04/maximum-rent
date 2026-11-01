"use client";

import Image from "next/image";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import { PillLink } from "@/components/ui/PillLink";

export function CtaBand() {
  const t = useTranslations("Cta");
  const company = useCompany();
  const phone = company.phones[0];

  return (
    <section className="px-3 py-5 sm:px-4 sm:py-8">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-ink">
        <Image
          src="/fleet-premium.webp"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="-z-10 object-cover object-[center_40%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/75 via-45% to-ink/20" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-ink/60 to-transparent" />
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
          <h2 className="max-w-xl text-balance font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-md text-white/75">{t("body")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/vozila">{t("primary")}</PillLink>
            {phone && (
              <PillLink href={phone.href} variant="light" icon={<Phone className="h-4 w-4" />}>
                {t("secondary")}
              </PillLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
