/**
 * Works out how many pieces of each extra are still free for a given period.
 *
 * Without this the same child seat can be promised to three guests for the
 * same week: the booking form has no idea what is already committed. The rule
 * mirrors the one used for vehicles — two periods clash when one starts before
 * the other ends and ends after the other starts.
 */

export type Booked = {
  /** Extra the pieces belong to. */
  extraId: string;
  qty: number;
  /** Rental period the pieces are tied up for. */
  from: Date;
  to: Date;
};

/** Free pieces per extra id, for one requested period. */
export type Availability = Record<string, number>;

/**
 * True when the two periods touch at all.
 *
 * Ends that merely meet — one returns at 10:00, the next picks up at 10:00 —
 * do not clash, which is why the comparison is strict.
 */
export function overlaps(
  aFrom: Date,
  aTo: Date,
  bFrom: Date,
  bTo: Date,
): boolean {
  return aFrom < bTo && aTo > bFrom;
}

/**
 * Pieces still free for [from, to], per extra.
 *
 * One pass over the bookings, so the cost stays linear no matter how many
 * extras are on offer.
 */
export function availabilityFor(
  extras: { id: string; totalStock: number }[],
  booked: Booked[],
  from: Date | null,
  to: Date | null,
): Availability {
  const free: Availability = {};
  for (const e of extras) free[e.id] = e.totalStock;

  // No usable period yet: show the full stock rather than a misleading zero.
  if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return free;
  }

  for (const b of booked) {
    if (free[b.extraId] === undefined) continue;
    if (!overlaps(from, to, b.from, b.to)) continue;
    free[b.extraId] = Math.max(0, free[b.extraId] - b.qty);
  }
  return free;
}

/**
 * The highest quantity a guest may pick: never more than allowed per booking,
 * and never more than is physically free.
 */
export function maxSelectable(
  perBookingLimit: number,
  freePieces: number,
): number {
  return Math.max(0, Math.min(perBookingLimit, freePieces));
}

// ---------------------------------------------------------------------------
// Mock bookings
// ---------------------------------------------------------------------------

/**
 * Stand-in for what is already committed.
 *
 * The real version is one query: confirmed inquiries joined to their extras,
 * filtered to periods that overlap the requested one. Only the body of
 * `getBookedExtras` changes then — the calculation above stays as it is.
 */
export const MOCK_BOOKINGS: Booked[] = [
  // Child seats: heavily booked over the first September week.
  { extraId: "seat-child", qty: 3, from: new Date("2026-09-01"), to: new Date("2026-09-07") },
  { extraId: "seat-child", qty: 4, from: new Date("2026-09-03"), to: new Date("2026-09-10") },
  { extraId: "seat-child", qty: 2, from: new Date("2026-09-12"), to: new Date("2026-09-15") },

  { extraId: "seat-booster", qty: 2, from: new Date("2026-09-02"), to: new Date("2026-09-08") },
  { extraId: "seat-booster", qty: 3, from: new Date("2026-09-05"), to: new Date("2026-09-09") },

  // GPS units: only six exist, and five are out in the first week.
  { extraId: "gps", qty: 3, from: new Date("2026-09-01"), to: new Date("2026-09-06") },
  { extraId: "gps", qty: 3, from: new Date("2026-09-04"), to: new Date("2026-09-11") },

  { extraId: "roof-rack", qty: 1, from: new Date("2026-09-03"), to: new Date("2026-09-09") },
  { extraId: "winter", qty: 2, from: new Date("2026-09-01"), to: new Date("2026-09-20") },
];

export function getBookedExtras(): Booked[] {
  return MOCK_BOOKINGS;
}
