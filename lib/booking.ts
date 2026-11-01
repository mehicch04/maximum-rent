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

export function dayStatus(busy: BusyRange[], day: Date): DayStatus {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const end = start + 86_400_000;
  let covered = 0;
  for (const r of busy) {
    const s = Math.max(start, new Date(r.from).getTime());
    const e = Math.min(end, new Date(r.to).getTime());
    if (e > s) covered += e - s;
  }
  if (covered <= 0) return "free";
  return covered >= 86_400_000 - 60_000 ? "booked" : "partial";
}
