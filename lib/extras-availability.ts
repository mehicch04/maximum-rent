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
// What is already committed
// ---------------------------------------------------------------------------

/**
 * Every piece of equipment currently promised to someone, from both places it
 * can be promised: the website and a booking taken by phone.
 *
 * Reading only one source is what would let the same child seat go out twice —
 * a clerk filling the manual form would never see what the website already
 * gave away, and vice versa.
 *
 * Only current and future periods are returned; finished rentals free their
 * equipment and would only bloat the payload.
 */
export async function getBookedExtras(): Promise<Booked[]> {
  const { prisma } = await import("@/lib/prisma");
  const now = new Date();

  try {
    const [online, manual] = await Promise.all([
      prisma.inquiryExtra.findMany({
        where: {
          extraId: { not: null },
          inquiry: {
            status: { in: ["CONFIRMED", "COMPLETED"] },
            returnAt: { gte: now },
          },
        },
        select: {
          extraId: true,
          qty: true,
          inquiry: { select: { pickupAt: true, returnAt: true } },
        },
      }),
      prisma.blockExtra.findMany({
        where: {
          extraId: { not: null },
          block: { kind: "MANUAL_BOOKING", endAt: { gte: now } },
        },
        select: {
          extraId: true,
          qty: true,
          block: { select: { startAt: true, endAt: true } },
        },
      }),
    ]);

    return [
      ...online.map((r) => ({
        extraId: r.extraId as string,
        qty: r.qty,
        from: r.inquiry.pickupAt,
        to: r.inquiry.returnAt,
      })),
      ...manual.map((r) => ({
        extraId: r.extraId as string,
        qty: r.qty,
        from: r.block.startAt,
        to: r.block.endAt,
      })),
    ];
  } catch (err) {
    // Failing open would let double bookings through, so an empty list is the
    // wrong fallback here; the caller decides how to handle it.
    console.error("[extras] availability lookup failed:", err);
    throw err;
  }
}
