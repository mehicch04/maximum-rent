"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
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
import { formatPrice } from "@/lib/currency";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { CarGallery } from "@/components/fleet/CarGallery";
import { ImageLightbox } from "@/components/fleet/ImageLightbox";
import { SimilarCars } from "@/components/fleet/SimilarCars";
import { CLASS_LABELS, FUEL_LABELS, TRANSMISSION_LABELS, label as pick } from "@/lib/car-labels";
import type { AppLocale } from "@/i18n/routing";
import { carCategories } from "@/lib/car-categories";
import { splitLocal, type BusyRange } from "@/lib/booking";
import { addDays, shortDate, todayISO } from "@/lib/dates";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { quote, type BookingState, type Loc } from "@/components/booking/state";

export function CarDetail({
  car,
  similar,
  locations,
  extras,
  busy,
  locale,
}: {
  car: CarListItem;
  similar: CarListItem[];
  locations: Loc[];
  extras: ExtraItem[];
  busy: BusyRange[];
  locale: string;
}) {
  const t = useTranslations("Fleet");
  const tb = useTranslations("Booking");
  const { currency } = useCurrency();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const lang = locale as AppLocale;

  const defaultLoc = locations[0]?.id ?? "";
  const [b, setB] = useState<BookingState>({
    pickupLoc: defaultLoc,
    returnLoc: "",
    diff: false,
    pickupDate: "",
    pickupTime: "10:00",
    returnDate: "",
    returnTime: "10:00",
  });
  const set = (p: Partial<BookingState>) => setB((s) => ({ ...s, ...p }));

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const known = (id: string | null) => (id && locations.some((l) => l.id === id) ? id : null);
    const a = splitLocal(q.get("pickupAt"));
    const r = splitLocal(q.get("returnAt"));
    const ok = a && r && a.date >= todayISO(0) && `${r.date}T${r.time}` > `${a.date}T${a.time}`;
    const pl = known(q.get("pickupLocationId"));
    const rl = known(q.get("returnLocationId"));
    setB((s) => {
      const pickupLoc = pl ?? s.pickupLoc;
      const diff = Boolean(rl && rl !== pickupLoc);
      return {
        ...s,
        pickupLoc,
        diff,
        returnLoc: diff && rl ? rl : "",
        pickupDate: ok ? a.date : todayISO(1),
        pickupTime: ok ? a.time : s.pickupTime,
        returnDate: ok ? r.date : todayISO(4),
        returnTime: ok ? r.time : s.returnTime,
      };
    });
  }, []);

  const q = quote(car, b, busy);
  const stickRef = useRef<HTMLDivElement>(null);
  const [stickTop, setStickTop] = useState(96);
  useEffect(() => {
    const el = stickRef.current;
    if (!el) return;
    const update = () => setStickTop(Math.min(96, window.innerHeight - el.offsetHeight - 24));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const [bar, setBar] = useState(false);
  useEffect(() => {
    const el = stickRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (bar) root.dataset.bar = "1";
    else delete root.dataset.bar;
    return () => {
      delete root.dataset.bar;
    };
  }, [bar]);

  const description = (lang !== "hr" ? car.descriptionEn : car.descriptionHr)?.trim();
  const cats = carCategories(car);

  const specs = [
    { icon: Users, label: t("spec.seats"), value: String(car.passengers) },
    { icon: DoorOpen, label: t("spec.doors"), value: String(car.doors) },
    { icon: Settings2, label: t("spec.gearbox"), value: pick(TRANSMISSION_LABELS[car.transmission], lang) },
    { icon: Fuel, label: t("spec.fuel"), value: pick(FUEL_LABELS[car.fuelType], lang) },
    { icon: Calendar, label: t("spec.year"), value: String(car.year) },
    { icon: Briefcase, label: t("spec.luggage"), value: car.luggage != null ? String(car.luggage) : "/" },
    { icon: Snowflake, label: t("spec.ac"), value: car.airCondition ? t("spec.yes") : t("spec.no") },
    { icon: Armchair, label: t("spec.class"), value: pick(CLASS_LABELS[car.carClass], lang) },
  ];

  const pickRange = (start: string, end: string | null) =>
    set({ pickupDate: start, returnDate: end ?? (b.returnDate > start ? b.returnDate : addDays(start, 3)) });

  return (
    <>
      <header className="mt-5">
        {cats[0] && (
          <span className="inline-flex rounded-full border border-brand/30 px-2.5 py-0.5 text-xs font-medium text-brand-strong">
            {t(`categories.${cats[0]}`)}
          </span>
        )}
        <h1 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          {car.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {[pick(TRANSMISSION_LABELS[car.transmission], lang), pick(FUEL_LABELS[car.fuelType], lang), `${car.passengers} ${t("spec.seats").toLowerCase()}`, String(car.year)].join(" · ")}
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="isolate overflow-hidden rounded-[22px] [transform:translateZ(0)]">
            <CarGallery
              images={car.images ?? []}
              title={car.title}
              onOpen={(i) => setLightbox(i)}
              autoPlay
              priority
              sizes="(max-width: 1023px) 92vw, 62vw"
            />
          </div>
        </div>

        <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div id="rezervacija" ref={stickRef} style={{ top: stickTop }} className="scroll-mt-24 lg:sticky">
            {car.isAvailable ? (
              <BookingWidget car={car} locations={locations} extras={extras} busy={busy} b={b} set={set} />
            ) : (
              <p className="rounded-[22px] bg-surface-muted px-5 py-4 text-sm text-muted-foreground">{t("notOffered")}</p>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-2">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">{t("specifications")}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {specs.map(({ icon: Icon, label, value }) => (
                <li key={label} className="rounded-2xl bg-surface-muted px-4 py-3.5">
                  <Icon className="h-4 w-4 text-brand-strong" />
                  <span className="mt-2.5 block text-xs text-muted-foreground">{label}</span>
                  <span className="block truncate text-sm font-semibold text-foreground">{value}</span>
                </li>
              ))}
            </ul>
          </section>

          {description && (
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">{t("description")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </section>
          )}

          {car.isAvailable && (
            <AvailabilityCalendar
              busy={busy}
              start={b.pickupDate}
              end={b.returnDate}
              onPick={pickRange}
              footer={
                q.ready && (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground">
                        <span className="first-letter:uppercase">{shortDate(locale, b.pickupDate)}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="first-letter:uppercase">{shortDate(locale, b.returnDate)}</span>
                      </p>
                      <p className={`mt-0.5 text-[13px] ${q.booked || !q.valid ? "text-rose-600 dark:text-rose-300" : "text-muted-foreground"}`}>
                        {!q.valid ? (
                          tb("invalid")
                        ) : q.booked ? (
                          tb("booked")
                        ) : (
                          <>
                            {tb("daysCount", { days: q.days })} · {tb("total")}{" "}
                            <bdi className="font-semibold text-foreground">{formatPrice(q.total, currency)}</bdi>
                          </>
                        )}
                      </p>
                    </div>
                    {q.canGo ? (
                      <Link
                        href={q.href}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        {tb("continue")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                )
              }
            />
          )}

        </div>
      </div>

      <SimilarCars cars={similar} locale={locale} title={t("similar")} />

      <AnimatePresence>
        {bar && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_40px_-28px_rgba(11,18,32,0.45)] backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
              <div className="min-w-0 leading-tight">
                <p className="truncate text-xs text-muted-foreground">
                  {q.valid && !q.booked ? (
                    <>
                      {tb("daysCount", { days: q.days })} · {tb("total")}
                    </>
                  ) : (
                    car.title
                  )}
                </p>
                <p className="mt-0.5 whitespace-nowrap">
                  <bdi className="font-display text-xl font-semibold text-foreground">
                    {formatPrice(q.valid && !q.booked ? q.total : car.pricePerDay ?? 0, currency)}
                  </bdi>
                  {!(q.valid && !q.booked) && <span className="text-xs text-muted-foreground"> {tb("perDay")}</span>}
                </p>
              </div>
              {q.canGo ? (
                <Link
                  href={q.href}
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(227,6,19,0.95)] transition-colors active:scale-[0.98]"
                >
                  {t("book")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href="#rezervacija"
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white"
                >
                  {tb("pickDates")}
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageLightbox
        images={car.images ?? []}
        title={car.title}
        openIndex={lightbox}
        onClose={() => setLightbox(null)}
        thumbSizes="(max-width: 1023px) 92vw, 62vw"
      />
    </>
  );
}
