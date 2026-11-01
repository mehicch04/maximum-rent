import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getCarBySlug } from "@/lib/car-detail";
import { getActiveLocations } from "@/lib/fleet-data";
import { getActiveExtras, rentalDays } from "@/lib/extras";
import { getBookedExtras } from "@/lib/extras-availability";
import { getAvailableCars, isValidPeriod } from "@/lib/availability";
import { getCarBusy } from "@/lib/car-busy";
import { SITE } from "@/lib/site-config";
import { Checkout } from "@/components/booking/Checkout";

export const dynamic = "force-dynamic";

type Props = {
  params: { locale: string; slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [car, t] = await Promise.all([
    getCarBySlug(params.slug),
    getTranslations({ locale: params.locale, namespace: "Booking" }),
  ]);
  return {
    title: car ? `${t("seoTitle")} · ${car.title}` : { absolute: SITE.name },
    robots: { index: false, follow: false },
  };
}

function defaults(): { start: Date; end: Date } {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 3);
  return { start, end };
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car || !car.isAvailable) notFound();

  let start = new Date(one(searchParams.pickupAt) ?? "");
  let end = new Date(one(searchParams.returnAt) ?? "");
  if (!isValidPeriod(start, end) || start.getTime() < Date.now() - 86_400_000) {
    ({ start, end } = defaults());
  }

  const [locations, extras, booked, busy, available] = await Promise.all([
    getActiveLocations(),
    getActiveExtras(),
    getBookedExtras().catch(() => []),
    getCarBusy(car.id),
    getAvailableCars(start, end).catch(() => []),
  ]);

  const pickId = one(searchParams.pickupLocationId);
  const retId = one(searchParams.returnLocationId);
  const pickup = locations.find((l) => l.id === pickId) ?? locations[0] ?? null;
  const ret = locations.find((l) => l.id === retId) ?? pickup;

  const days = rentalDays(start, end);
  const base = car.pricePerDay ?? 0;
  const upsell = available
    .filter((c) => c.id !== car.id && c.pricePerDay != null && c.pricePerDay > base)
    .sort((a, b) => (a.pricePerDay ?? 0) - (b.pricePerDay ?? 0))
    .slice(0, 2)
    .map((c) => ({ car: c, diff: ((c.pricePerDay ?? 0) - base) * days }));

  const slim = (l: typeof pickup) => (l ? { id: l.id, name: l.name, slug: l.slug } : null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Checkout
        car={car}
        pickupAt={start.toISOString()}
        returnAt={end.toISOString()}
        pickup={slim(pickup)}
        ret={slim(ret)}
        extras={extras}
        booked={booked}
        busy={busy}
        upsell={upsell}
        locations={locations.map((l) => ({ id: l.id, name: l.name, slug: l.slug }))}
      />
    </div>
  );
}
