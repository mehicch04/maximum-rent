import { prisma } from "@/lib/prisma";

export type Range = "today" | "7d" | "month" | "year" | "custom";

export const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Danas" },
  { value: "7d", label: "Zadnjih 7 dana" },
  { value: "month", label: "Ovaj mjesec" },
  { value: "year", label: "Ova godina" },
  { value: "custom", label: "Prilagođeni period" },
];

export const RANGE_LABEL: Record<Range, string> = {
  today: "danas",
  "7d": "zadnjih 7 dana",
  month: "ovaj mjesec",
  year: "ova godina",
  custom: "odabrani period",
};

export const COMPARED_TO: Record<Range, string> = {
  today: "u odnosu na jučer",
  "7d": "u odnosu na prethodnih 7 dana",
  month: "u odnosu na prošli mjesec",
  year: "u odnosu na prošlu godinu",
  custom: "u odnosu na prethodni period iste dužine",
};

export type Kpi = {
  key: string;
  label: string;
  value: string;
  change: number | null;
  lowerIsBetter?: boolean;
  hint?: string;
};

/** Explicit dates for a custom period, as they arrive from the URL. */
export type CustomRange = { from?: string; to?: string };

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
  return (
    typeof v === "string" &&
    ["today", "7d", "month", "year", "custom"].includes(v)
  );
}

const DAY = 86_400_000;

function bounds(range: Range, custom?: { from?: string; to?: string }) {
  const now = new Date();

  if (range === "custom") {
    const start = custom?.from ? new Date(`${custom.from}T00:00:00`) : null;
    const end = custom?.to ? new Date(`${custom.to}T23:59:59.999`) : null;

    if (start && end && !Number.isNaN(start.getTime()) && end > start) {
      const span = end.getTime() - start.getTime();
      return {
        from: start,
        to: end,
        prevFrom: new Date(start.getTime() - span),
        prevTo: new Date(start.getTime()),
        now,
      };
    }
    range = "month";
  }

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

function fleetWhere(now: Date) {
  return {
    OR: [
      { isAvailable: true },
      {
        isAvailable: false,
        inquiries: {
          some: {
            status: { in: [...HOLDING] },
            returnAt: { gte: now },
          },
        },
      },
    ],
  };
}

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

  return {
    revenue: num(agg._sum.totalPrice),
    avgDays: num(agg._avg.rentalDays),
    bookings: agg._count,
    cancelled,
    total,
  };
}

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

export async function getAnalytics(range: Range, custom?: CustomRange): Promise<Analytics> {
  const { from, to, prevFrom, prevTo, now } = bounds(range, custom);

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

/** Buckets differ per period so the axis never turns into a wall of labels. */
function buckets(range: Range, from: Date, to: Date) {
  if (range === "custom") {
    const out: { label: string; start: Date; end: Date }[] = [];
    const totalDays = Math.max(
      1,
      Math.ceil((to.getTime() - from.getTime()) / DAY),
    );
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (totalDays <= 14) {
      for (let i = 0; i < totalDays; i++) {
        const s = new Date(from.getTime() + i * DAY);
        out.push({ label: fmt(s), start: s, end: new Date(s.getTime() + DAY) });
      }
    } else if (totalDays <= 92) {
      for (let i = 0; i < totalDays; i += 7) {
        const s = new Date(from.getTime() + i * DAY);
        const e = new Date(Math.min(s.getTime() + 7 * DAY, to.getTime() + 1));
        out.push({ label: fmt(s), start: s, end: e });
      }
    } else {
      const names = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Avg","Sep","Okt","Nov","Dec"];
      const cur = new Date(from.getFullYear(), from.getMonth(), 1);
      while (cur <= to) {
        const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        out.push({
          label: names[cur.getMonth()],
          start: new Date(Math.max(cur.getTime(), from.getTime())),
          end: new Date(Math.min(next.getTime(), to.getTime() + 1)),
        });
        cur.setMonth(cur.getMonth() + 1);
      }
    }
    return out;
  }

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

export async function getTrend(range: Range, custom?: CustomRange): Promise<TrendPoint[]> {
  const { from, to } = bounds(range, custom);
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

export async function getTopCars(range: Range, custom?: CustomRange): Promise<TopCar[]> {
  const { from, to } = bounds(range, custom);

  const grouped = await prisma.inquiry.groupBy({
    by: ["carId"],
    where: {
      status: { in: [...EARNING] },
      createdAt: { gte: from, lte: to },
      carId: { not: null },
    },
    _sum: { totalPrice: true },
    _count: true,
  });

  const ids = grouped.map((g) => g.carId as string);
  const cars = await prisma.car.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, plate: true },
  });
  const carById = new Map(cars.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const car = carById.get(g.carId as string);
      return {
        id: g.carId as string,
        title: car?.title ?? "Nepoznato vozilo",
        plate: car?.plate ?? "",
        rentals: g._count,
        revenue: num(g._sum.totalPrice),
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.rentals - a.rentals)
    .slice(0, 5);
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
