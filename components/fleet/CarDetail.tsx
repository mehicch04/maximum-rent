"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Armchair,
  Briefcase,
  Calendar,
  DoorOpen,
  Fuel,
  Settings2,
  Snowflake,
  Users,
} from "lucide-react";

import type { CarListItem } from "@/lib/types";
import type { ExtraItem } from "@/lib/extras";
import type { Booked } from "@/lib/extras-availability";
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { CarGallery } from "@/components/fleet/CarGallery";
import { ImageLightbox } from "@/components/fleet/ImageLightbox";
import { InquiryModal } from "@/components/reservation/InquiryModal";
import { SimilarCars } from "@/components/fleet/SimilarCars";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { buildWhatsAppUrl, type InquiryContext } from "@/lib/whatsapp";

export function CarDetail({
  car,
  similar,
  locations,
  extras,
  bookedExtras,
  locale,
}: {
  car: CarListItem;
  similar: CarListItem[];
  locations: { id: string; name: string }[];
  extras: ExtraItem[];
  bookedExtras: Booked[];
  locale: string;
}) {
  const t = useTranslations("Fleet");
  const { currency } = useCurrency();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);

  const en = locale === "en";

  const whatsappUrl = buildWhatsAppUrl({
    car: { title: car.title },
    locale,
  } as InquiryContext);
  const description = en ? car.descriptionEn : car.descriptionHr;

  const specs = [
    {
      icon: Users,
      label: en ? "Seats" : "Sjedišta",
      value: String(car.passengers),
    },
    { icon: DoorOpen, label: en ? "Doors" : "Vrata", value: String(car.doors) },
    {
      icon: Settings2,
      label: en ? "Gearbox" : "Mjenjač",
      value: car.transmission,
    },
    { icon: Fuel, label: en ? "Fuel" : "Gorivo", value: car.fuelType },
    { icon: Calendar, label: en ? "Year" : "Godište", value: String(car.year) },
    {
      icon: Briefcase,
      label: en ? "Luggage" : "Prtljag",
      value: car.luggage ?? "—",
    },
    {
      icon: Snowflake,
      label: en ? "Air conditioning" : "Klima",
      value: car.airCondition ? (en ? "Yes" : "Da") : en ? "No" : "Ne",
    },
    { icon: Armchair, label: en ? "Class" : "Klasa", value: car.carClass },
  ];

  return (
    <>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <CarGallery
            images={car.images ?? []}
            title={car.title}
            onOpen={(i) => setLightbox(i)}
            autoPlay
            priority
            sizes="(max-width: 1023px) 92vw, 52vw"
          />
        </div>

        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {car.title}
          </h1>

          {car.pricePerDay != null && (
            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-brand-strong">
                {formatPrice(car.pricePerDay, currency)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {en ? "day" : "dan"}
              </span>
            </p>
          )}

          {!car.isAvailable ? (
            <p className="mt-4 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
              {t("notOffered")}
            </p>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBooking(true)}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-brand-foreground shadow-brand transition-colors hover:bg-brand-700"
              >
                {t("bookNow")}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted px-4 text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("specifications")}
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="truncate text-sm font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {description && (
            <div className="mt-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("description")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      <SimilarCars cars={similar} locale={locale} title={t("similar")} />

      <ImageLightbox
        images={car.images ?? []}
        title={car.title}
        openIndex={lightbox}
        onClose={() => setLightbox(null)}
        thumbSizes="(max-width: 1023px) 92vw, 52vw"
      />

      {booking && (
        <InquiryModal
          car={car}
          search={{}}
          locations={locations}
          extras={extras}
          bookedExtras={bookedExtras}
          onClose={() => setBooking(false)}
        />
      )}
    </>
  );
}
