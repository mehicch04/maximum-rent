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

export function overlaps(
  aFrom: Date,
  aTo: Date,
  bFrom: Date,
  bTo: Date,
): boolean {
  return aFrom < bTo && aTo > bFrom;
}

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

export function maxSelectable(
  perBookingLimit: number,
  freePieces: number,
): number {
  return Math.max(0, Math.min(perBookingLimit, freePieces));
}

export async function getBookedExtras(): Promise<Booked[]> {
  const { prisma } = await import("@/lib/prisma");
  const now = new Date();

  try {
    const [online, manual] = await Promise.all([
      prisma.inquiryExtra.findMany({
        where: {
          extraId: { not: null },
          inquiry: {
            status: { in: ["CONFIRMED", "IN_PROGRESS"] },
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
    console.error("[extras] availability lookup failed:", err);
    throw err;
  }
}

/** One period a car is spoken for, whatever the reason. */
export type CarBusy = {
  carId: string;
  from: Date;
  to: Date;
  label: string;
  /** Set for reservations, so a form can skip the one it is editing. */
  inquiryId?: string;
  /** Who holds it, so a clash can name the guest instead of just the dates. */
  guest?: string;
  reference?: string;
};

export async function getCarOccupancy(): Promise<CarBusy[]> {
  const { prisma } = await import("@/lib/prisma");
  const now = new Date();

  const [rentals, blocks] = await Promise.all([
    prisma.inquiry.findMany({
      where: {
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        carId: { not: null },
        returnAt: { gte: now },
      },
      select: {
        id: true,
        carId: true,
        pickupAt: true,
        returnAt: true,
        firstName: true,
        lastName: true,
        reference: true,
      },
    }),
    prisma.carBlock.findMany({
      where: { endAt: { gte: now } },
      select: { carId: true, startAt: true, endAt: true, kind: true },
    }),
  ]);

  const BLOCK_LABEL: Record<string, string> = {
    MANUAL_BOOKING: "manuelna rezervacija",
    MAINTENANCE: "servis",
    DAMAGE: "oštećenje",
    PRIVATE: "privatna upotreba",
  };

  return [
    ...rentals.map((r) => ({
      carId: r.carId as string,
      from: r.pickupAt,
      to: r.returnAt,
      label: "rezervisano",
      inquiryId: r.id,
      guest: [r.firstName, r.lastName].filter(Boolean).join(" "),
      reference: r.reference,
    })),
    ...blocks.map((b) => ({
      carId: b.carId,
      from: b.startAt,
      to: b.endAt,
      label: BLOCK_LABEL[b.kind] ?? "blokirano",
    })),
  ];
}

/** Cars that clash with [from, to], mapped to why they are unavailable. */
export function busyCarsFor(
  occupancy: CarBusy[],
  from: Date | null,
  to: Date | null,
): Map<string, string> {
  const out = new Map<string, string>();
  if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return out;
  }
  for (const o of occupancy) {
    if (overlaps(from, to, o.from, o.to) && !out.has(o.carId)) {
      out.set(o.carId, o.label);
    }
  }
  return out;
}
