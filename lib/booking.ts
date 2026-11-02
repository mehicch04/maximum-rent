import { toISODate } from "@/lib/dates";

export type BusyRange = { from: string; to: string };

export type BookingQuery = {
  pickupLocationId?: string;
  returnLocationId?: string;
  pickupAt?: string;
  returnAt?: string;
};

export function bookingHref(slug: string, q: BookingQuery): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v) p.set(k, v);
  const s = p.toString();
  return `/vozila/${slug}/rezervacija${s ? `?${s}` : ""}`;
}

export function joinLocal(date: string, time: string): Date {
  return new Date(`${date}T${time || "10:00"}`);
}

export function splitLocal(iso?: string | null): { date: string; time: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const m = d.getMinutes() < 15 ? "00" : d.getMinutes() < 45 ? "30" : "00";
  const h = d.getMinutes() >= 45 ? (d.getHours() + 1) % 24 : d.getHours();
  return { date: toISODate(d), time: `${String(h).padStart(2, "0")}:${m}` };
}

export function overlapsBusy(busy: BusyRange[], start: Date, end: Date): boolean {
  const a = start.getTime();
  const b = end.getTime();
  return busy.some((r) => new Date(r.from).getTime() < b && new Date(r.to).getTime() > a);
}

export type DayStatus = "free" | "partial" | "booked";

export type DayInfo = { status: DayStatus; from: string | null; until: string | null };

const SLOT = 30 * 60_000;
const two = (n: number) => String(n).padStart(2, "0");
const clock = (ms: number) => {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
};

export function dayInfo(busy: BusyRange[], day: Date): DayInfo {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
  const segs = busy
    .map((r) => [Math.max(start, new Date(r.from).getTime()), Math.min(end, new Date(r.to).getTime())] as [number, number])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);
  if (!segs.length) return { status: "free", from: null, until: null };

  const merged: [number, number][] = [];
  for (const [s, e] of segs) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  const covered = merged.reduce((sum, [s, e]) => sum + (e - s), 0);
  if (end - start - covered < SLOT) return { status: "booked", from: null, until: null };

  const lastEnd = merged[merged.length - 1][1];
  const firstStart = merged[0][0];
  const fromMs = lastEnd < end ? start + Math.ceil((lastEnd - start) / SLOT) * SLOT : null;
  const untilMs = firstStart > start ? start + Math.floor((firstStart - start) / SLOT) * SLOT : null;
  return {
    status: "partial",
    from: fromMs !== null && fromMs < end ? clock(fromMs) : null,
    until: untilMs !== null && untilMs > start ? clock(untilMs) : null,
  };
}
