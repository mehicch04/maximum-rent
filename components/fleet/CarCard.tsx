"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Car as CarIcon,
  ChevronRight,
  Cog,
  Fuel,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import {
  CLASS_LABELS,
  FUEL_LABELS,
  TRANSMISSION_LABELS,
  label,
} from "@/lib/car-labels";
import { buildWhatsAppUrl, type InquiryContext } from "@/lib/whatsapp";
import type { CarListItem, SearchContext } from "@/lib/types";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { CarDoorIcon } from "@/components/ui/CarDoorIcon";
import { Price } from "@/components/currency/Price";
import { CarGallery } from "./CarGallery";
import { ImageLightbox } from "./ImageLightbox";

type Props = {
  car: CarListItem;
  search?: SearchContext;
  onSelect?: (car: CarListItem) => void;
  /** Eagerly load this card's photo (first above-the-fold cards on the fleet page). */
  priority?: boolean;
  /** Override the image `sizes` (smaller on the homepage teaser). */
  imageSizes?: string;
};

export function CarCard({
  car,
  search,
  onSelect,
  priority = false,
  imageSizes,
}: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Fleet");
  const common = useTranslations("Common");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const images = car.images ?? [];

  const inquiry: InquiryContext = {
    car: { title: car.title },
    pickupLocation: search?.pickupLocation,
    returnLocation: search?.returnLocation,
    pickupAt: search?.pickupAt,
    returnAt: search?.returnAt,
    locale,
  };
  const whatsappUrl = buildWhatsAppUrl(inquiry);

  const specs = [
    { icon: CarIcon, value: label(CLASS_LABELS[car.carClass], locale) },
    { icon: Calendar, value: String(car.year) },
    { icon: Cog, value: label(TRANSMISSION_LABELS[car.transmission], locale) },
    { icon: Users, value: String(car.passengers) },
    {
      icon: Fuel,
      value: [label(FUEL_LABELS[car.fuelType], locale), car.emissionClass]
        .filter(Boolean)
        .join(" · "),
    },
    { icon: CarDoorIcon, value: String(car.doors) },
  ];

  return (
    <article
      data-frozen={lightbox !== null || undefined}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-300 [@media(hover:hover)]:hover:-translate-y-1 hover:border-brand/50 hover:shadow-card-hover [@media(hover:hover)]:data-[frozen]:-translate-y-1 [@media(hover:hover)]:data-[frozen]:border-brand/50 [@media(hover:hover)]:data-[frozen]:shadow-card-hover"
    >
      <span className="absolute left-4 top-4 z-10 rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-foreground">
        {label(CLASS_LABELS[car.carClass], locale)}
      </span>

      {/* Above the stretched link so zooming a photo still works. */}
      <div className="relative z-10">
        <CarGallery
          images={images}
          title={car.title}
          onOpen={setLightbox}
          frozen={lightbox !== null}
          priority={priority}
          sizes={imageSizes}
        />
      </div>

      <ImageLightbox
        images={images}
        title={car.title}
        openIndex={lightbox}
        onClose={() => setLightbox(null)}
        thumbSizes={imageSizes}
      />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">
            <Link
              href={`/${locale}/vozila/${car.slug}`}
              className="transition-colors before:absolute before:inset-0 before:z-0 before:content-[''] hover:text-brand-strong"
            >
              {car.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {car.brand} {car.model}
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {specs.map((spec, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <spec.icon className="h-4 w-4 shrink-0 text-brand" />
              <span className="truncate text-sm font-medium text-foreground">
                {spec.value}
              </span>
            </li>
          ))}
        </ul>

        {car.pricePerDay != null && (
          <p className="text-sm text-muted-foreground">
            {common("from")}{" "}
            <Price
              bam={car.pricePerDay}
              className="text-base font-semibold text-foreground"
            />{" "}
            / {common("perDay")}
          </p>
        )}

        <div className="relative z-10 mt-auto flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => onSelect?.(car)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("select")}
            <ChevronRight className="h-4 w-4" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-foreground transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </article>
  );
}
