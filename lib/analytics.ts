import { prisma } from "@/lib/prisma";

/**
 * Analytics computed from real bookings.
 *
 * Everything is derived from confirmed inquiries, manual car blocks and the
 * extras inventory. What leaves this file has the same shape as the earlier
 * placeholder version, so the page and its components did not need changing.
 */

export type Range = "today" | "7d" | "month" | "year";

export const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Danas" },
  { value: "7d", label: "Zadnjih 7 dana" },
  { value: "month", label: "Ovaj mjesec" },
  { value: "year", label: "Ova godina" },
];

export const RANGE_LABEL: Record<Range, string> = {
  today: "danas",
  "7d": "zadnjih 7 dana",
  month: "ovaj mjesec",
  year: "ova godina",
};

export const COMPARED_TO: Record<Range, string> = {
  today: "u odnosu na jučer",
  "7d": "u odnosu na prethodnih 7 dana",
  month: "u odnosu na prošli mjesec",
  year: "u odnosu na prošlu godinu",
};

export type Kpi = {
  key: string;
  label: string;
  value: string;
  change: number | null;
  lowerIsBetter?: boolean;
  hint?: string;
};

export type Analytics = { range: Range; kpis: Kpi[] };
export type TrendPoint = { label: string; bookings: number; revenue: number };
export type FleetVehicle = { id: string; title: string; plate: string; note: string };
export type FleetSlice = {
  key: string;
  label: string;
  count: number;
  color: string;
  vehicles: FleetVehicle[];
};
export type TopCar = { id: string; title: string; plate: string; rentals: number; revenue: number };
export type ExtraStat = { name: string; rented: number; stock: number };

export function isRange(v: unknown): v is Range {
  return typeof v === "string" && ["today", "7d", "month", "year"].includes(v);
}

// ---------------------------------------------------------------------------
// Periods
// ---------------------------------------------------------------------------

const DAY = 86_400_000;

/**
 * Start and end of the selected period, plus the one directly before it of the
 * same length, so the percentage beside each figure compares like with like.
 */
function bounds(range: Range) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let from: Date;
  const to = now;

  switch (range) {
    case "today":
      from = startOfDay;
      break;
    case "7d":
      from = new Date(startOfDay.getTime() - 6 * DAY);
      break;
    case "year":
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const span = to.getTime() - from.getTime();
  return {
    from,
    to,
    prevFrom: new Date(from.getTime() - span),
    prevTo: new Date(from.getTime()),
    now,
  };
}

/** Percentage change, or null when there is nothing to compare against. */
function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

const num = (v: unknown) => (v == null ? 0 : Number(v));
const fmtMoney = (n: number) => `${Math.round(n).toLocaleString("hr-HR")} KM`;

/** Earns revenue. Cancelled and unanswered inquiries do not. */
const EARNING = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] as const;

/** Statuses that keep a vehicle tied up. */
const HOLDING = ["CONFIRMED", "IN_PROGRESS"] as const;

/**
 * Which vehicles count as the fleet for reporting.
 *
 * Cars in the offer, plus any withdrawn car that still has a rental running or
 * booked. A car being sold is off the website, but while a guest is driving it
 * it is still part of what the business has on the road: dropping it made the
 * utilisation figure jump on its own and hid the car from the fleet chart
 * while it was physically out.
 */
function fleetWhere(now: Date) {
  return {
    OR: [
      { isAvailable: true },
      {
        isAvailable: false,
        inquiries: {
          some: {
            // Spread rather than the const tuple itself: Prisma expects a
            // mutable array and rejects a readonly one outright.
            status: { in: [...HOLDING] },
            returnAt: { gte: now },
          },
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

async function windowTotals(from: Date, to: Date) {
  const [agg, cancelled, total] = await Promise.all([
    prisma.inquiry.aggregate({
      where: { status: { in: [...EARNING] }, createdAt: { gte: from, lte: to } },
      _sum: { totalPrice: true },
      _avg: { rentalDays: true },
      _count: true,
    }),
    prisma.inquiry.count({
      where: { status: "CANCELLED", createdAt: { gte: from, lte: to } },
    }),
    prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to } } }),
  ]);

  // Revenue comes from reservations alone. Phone bookings used to be stored as
  // blocks and were added in here, which meant the reports and the export never
  // matched; they are reservations now, so there is one place to read.
  return {
    revenue: num(agg._sum.totalPrice),
    avgDays: num(agg._avg.rentalDays),
    bookings: agg._count,
    cancelled,
    total,
  };
}

/**
 * Share of the fleet actually out on rent across the period, measured in
 * car-days: each booking contributes the days it overlaps the window, against
 * what the whole fleet could have delivered.
 */
async function utilisation(from: Date, to: Date): Promise<number> {
  const [fleet, rentals, manual] = await Promise.all([
    prisma.car.count({ where: fleetWhere(new Date()) }),
    prisma.inquiry.findMany({
      where: {
        status: { in: [...EARNING] },
        pickupAt: { lt: to },
        returnAt: { gt: from },
      },
      select: { pickupAt: true, returnAt: true },
    }),
    prisma.carBlock.findMany({
      where: { kind: "MANUAL_BOOKING", startAt: { lt: to }, endAt: { gt: from } },
      select: { startAt: true, endAt: true },
    }),
  ]);

  const periods = [
    ...rentals.map((r) => ({ p: r.pickupAt, r: r.returnAt })),
    ...manual.map((m) => ({ p: m.startAt, r: m.endAt })),
  ];

  const periodDays = Math.max(1, (to.getTime() - from.getTime()) / DAY);
  const capacity = fleet * periodDays;
  if (capacity === 0) return 0;

  const used = periods.reduce((sum, r) => {
    const start = Math.max(r.p.getTime(), from.getTime());
    const end = Math.min(r.r.getTime(), to.getTime());
    return sum + Math.max(0, end - start) / DAY;
  }, 0);

  return Math.min(100, Math.round((used / capacity) * 100));
}

export async function getAnalytics(range: Range): Promise<Analytics> {
  const { from, to, prevFrom, prevTo, now } = bounds(range);

  const [cur, prev, utilNow, utilPrev, active, upcoming, fleetSize] =
    await Promise.all([
      windowTotals(from, to),
      windowTotals(prevFrom, prevTo),
      utilisation(from, to),
      utilisation(prevFrom, prevTo),
      prisma.inquiry.count({
        where: {
          status: { in: [...EARNING] },
          pickupAt: { lte: now },
          returnAt: { gte: now },
        },
      }),
      prisma.inquiry.count({
        where: { status: { in: [...EARNING] }, pickupAt: { gt: now } },
      }),
      prisma.car.count({ where: fleetWhere(now) }),
    ]);

  const rate = (c: { cancelled: number; total: number }) =>
    c.total === 0 ? 0 : Math.round((c.cancelled / c.total) * 100);

  const kpis: Kpi[] = [
    {
      key: "utilisation",
      label: "Iskoristivost flote",
      value: `${utilNow} %`,
      change: pctChange(utilNow, utilPrev),
      hint: `${active} od ${fleetSize} vozila trenutno izdato`,
    },
    {
      key: "revenue",
      label: "Ukupan prihod",
      value: fmtMoney(cur.revenue),
      change: pctChange(cur.revenue, prev.revenue),
      hint: "najam i dodatna oprema",
    },
    {
      key: "active",
      label: "Aktivni najmovi",
      value: String(active),
      change: null,
      hint: "vozila trenutno kod gostiju",
    },
    {
      key: "upcoming",
      label: "Nadolazeće rezervacije",
      value: String(upcoming),
      change: null,
      hint: "potvrđene, još nisu preuzete",
    },
    {
      key: "duration",
      label: "Prosječno trajanje najma",
      value:
        cur.avgDays > 0
          ? `${cur.avgDays.toFixed(1).replace(".", ",")} dana`
          : "—",
      change: pctChange(cur.avgDays, prev.avgDays),
      hint: "po potvrđenoj rezervaciji",
    },
    {
      key: "cancelled",
      label: "Stopa otkazivanja",
      value: `${rate(cur)} %`,
      change: pctChange(rate(cur), rate(prev)),
      lowerIsBetter: true,
      hint: "otkazane od svih upita",
    },
  ];

  return { range, kpis };
}

// ---------------------------------------------------------------------------
// Trend
// ---------------------------------------------------------------------------

/** Buckets differ per period so the axis never turns into a wall of labels. */
function buckets(range: Range, from: Date, to: Date) {
  const out: { label: string; start: Date; end: Date }[] = [];

  if (range === "today") {
    for (let h = 6; h < 22; h += 3) {
      const s = new Date(from);
      s.setHours(h, 0, 0, 0);
      out.push({
        label: `${String(h).padStart(2, "0")}h`,
        start: s,
        end: new Date(s.getTime() + 3 * 3_600_000),
      });
    }
  } else if (range === "7d") {
    const names = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
    for (let i = 0; i < 7; i++) {
      const s = new Date(from.getTime() + i * DAY);
      out.push({ label: names[s.getDay()], start: s, end: new Date(s.getTime() + DAY) });
    }
  } else if (range === "year") {
    const names = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Avg","Sep","Okt","Nov","Dec"];
    for (let m = 0; m <= to.getMonth(); m++) {
      out.push({
        label: names[m],
        start: new Date(to.getFullYear(), m, 1),
        end: new Date(to.getFullYear(), m + 1, 1),
      });
    }
  } else {
    const last = new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= last; d += 7) {
      const end = Math.min(d + 6, last);
      out.push({
        label: `${d}–${end}`,
        start: new Date(to.getFullYear(), to.getMonth(), d),
        end: new Date(to.getFullYear(), to.getMonth(), end + 1),
      });
    }
  }
  return out;
}

export async function getTrend(range: Range): Promise<TrendPoint[]> {
  const { from, to } = bounds(range);
  const slots = buckets(range, from, to);

  // One query, bucketed in memory: far cheaper than a query per bucket.
  const rows = await prisma.inquiry.findMany({
    where: { status: { in: [...EARNING] }, createdAt: { gte: from, lte: to } },
    select: { createdAt: true, totalPrice: true },
  });

  return slots.map((s) => {
    const inSlot = rows.filter((r) => r.createdAt >= s.start && r.createdAt < s.end);
    return {
      label: s.label,
      bookings: inSlot.length,
      revenue: inSlot.reduce((a, r) => a + num(r.totalPrice), 0),
    };
  });
}

// ---------------------------------------------------------------------------
// Fleet status
// ---------------------------------------------------------------------------

const fmtDay = (d: Date) =>
  new Intl.DateTimeFormat("hr-HR", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
  }).format(d);

export async function getFleetStatus(): Promise<FleetSlice[]> {
  const now = new Date();

  const [cars, rentals, blocks] = await Promise.all([
    prisma.car.findMany({
      where: fleetWhere(now),
      select: { id: true, title: true, plate: true, isAvailable: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.inquiry.findMany({
      where: {
        status: { in: [...EARNING] },
        pickupAt: { lte: now },
        returnAt: { gte: now },
        carId: { not: null },
      },
      select: { carId: true, returnAt: true },
    }),
    prisma.carBlock.findMany({
      where: { startAt: { lte: now }, endAt: { gte: now } },
      select: { carId: true, endAt: true, reason: true, kind: true, clientName: true },
    }),
  ]);

  const rentedBy = new Map(rentals.map((r) => [r.carId as string, r]));
  const blockedBy = new Map(blocks.map((b) => [b.carId, b]));

  const rented: FleetVehicle[] = [];
  const service: FleetVehicle[] = [];
  const free: FleetVehicle[] = [];

  const REASON: Record<string, string> = {
    MAINTENANCE: "servis",
    DAMAGE: "oštećenje",
    PRIVATE: "privatna upotreba",
  };

  for (const c of cars) {
    const block = blockedBy.get(c.id);

    // A booking taken by phone is a rental, not downtime: it belongs with the
    // cars that are out earning, otherwise the chart understates the fleet.
    if (block?.kind === "MANUAL_BOOKING") {
      rented.push({
        id: c.id,
        title: c.title,
        plate: c.plate ?? "",
        note: `${block.clientName ?? "manuelna rezervacija"}, vraća se ${fmtDay(block.endAt)}`,
      });
      continue;
    }

    if (block) {
      service.push({
        id: c.id,
        title: c.title,
        plate: c.plate ?? "",
        note: `${block.reason || REASON[block.kind] || "blokirano"}, do ${fmtDay(block.endAt)}${c.isAvailable ? "" : " · povučeno iz ponude"}`,
      });
      continue;
    }
    const rent = rentedBy.get(c.id);
    if (rent) {
      rented.push({
        id: c.id,
        title: c.title,
        plate: c.plate ?? "",
        note: `vraća se ${fmtDay(rent.returnAt)}${c.isAvailable ? "" : " · povučeno iz ponude"}`,
      });
      continue;
    }
    free.push({ id: c.id, title: c.title, plate: c.plate ?? "", note: "slobodno" });
  }

  return [
    { key: "rented", label: "U najmu", count: rented.length, color: "var(--chart-rented)", vehicles: rented },
    { key: "available", label: "Dostupno", count: free.length, color: "var(--chart-available)", vehicles: free },
    { key: "service", label: "Nedostupno", count: service.length, color: "var(--chart-service)", vehicles: service },
  ];
}

// ---------------------------------------------------------------------------
// Top vehicles and extras
// ---------------------------------------------------------------------------

export async function getTopCars(range: Range): Promise<TopCar[]> {
  const { from, to } = bounds(range);

  const grouped = await prisma.inquiry.groupBy({
    by: ["carId"],
    where: {
      status: { in: [...EARNING] },
      createdAt: { gte: from, lte: to },
      carId: { not: null },
    },
    _sum: { totalPrice: true },
    _count: true,
    orderBy: { _sum: { totalPrice: "desc" } },
    take: 5,
  });

  const ids = grouped.map((g) => g.carId as string);
  const cars = await prisma.car.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, plate: true },
  });
  const carById = new Map(cars.map((c) => [c.id, c]));

  return grouped.map((g) => {
    const car = carById.get(g.carId as string);
    return {
      id: g.carId as string,
      title: car?.title ?? "Nepoznato vozilo",
      plate: car?.plate ?? "",
      rentals: g._count,
      revenue: num(g._sum.totalPrice),
    };
  });
}

export async function getExtrasStats(): Promise<ExtraStat[]> {
  const now = new Date();

  const [extras, out] = await Promise.all([
    prisma.extra.findMany({
      where: { isActive: true },
      select: { id: true, nameHr: true, totalStock: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.inquiryExtra.findMany({
      where: {
        inquiry: {
          status: { in: [...EARNING] },
          pickupAt: { lte: now },
          returnAt: { gte: now },
        },
      },
      select: { extraId: true, qty: true },
    }),
  ]);

  const rentedBy = new Map<string, number>();
  for (const r of out) {
    if (!r.extraId) continue;
    rentedBy.set(r.extraId, (rentedBy.get(r.extraId) ?? 0) + r.qty);
  }

  return extras.map((e) => ({
    name: e.nameHr,
    rented: rentedBy.get(e.id) ?? 0,
    stock: e.totalStock,
  }));
}
