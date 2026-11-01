import type { CarListItem } from "@/lib/types";
import type { ExtraItem } from "@/lib/extras";
import { rentalDays } from "@/lib/extras";
import { bookingHref, joinLocal, overlapsBusy, type BusyRange } from "@/lib/booking";

export type BookingState = {
  pickupLoc: string;
  returnLoc: string;
  diff: boolean;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
};

export type Loc = { id: string; name: string; slug: string };

export function extraText(e: Pick<ExtraItem, "nameHr" | "nameEn" | "noteHr" | "noteEn">, locale: string) {
  return locale === "hr" ? { name: e.nameHr, note: e.noteHr } : { name: e.nameEn, note: e.noteEn };
}

export function quote(car: CarListItem, b: BookingState, busy: BusyRange[]) {
  const ready = Boolean(b.pickupDate && b.returnDate);
  const start = joinLocal(b.pickupDate, b.pickupTime);
  const end = joinLocal(b.returnDate, b.returnTime);
  const valid = ready && end.getTime() > start.getTime();
  const days = valid ? rentalDays(start, end) : 1;
  const booked = valid && overlapsBusy(busy, start, end);
  const returnId = b.diff ? b.returnLoc : b.pickupLoc;
  const total = (car.pricePerDay ?? 0) * days;
  const canGo = valid && !booked && car.isAvailable && Boolean(b.pickupLoc && returnId);
  const href = bookingHref(car.slug, {
    pickupLocationId: b.pickupLoc || undefined,
    returnLocationId: returnId || undefined,
    pickupAt: valid ? start.toISOString() : undefined,
    returnAt: valid ? end.toISOString() : undefined,
  });
  return { ready, start, end, valid, days, booked, returnId, total, canGo, href };
}
