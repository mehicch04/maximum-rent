const pad = (n: number) => String(n).padStart(2, "0");

import { intlLocale as intl } from "@/i18n/routing";

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function todayISO(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toISODate(d);
}

export function monthLabel(locale: string, d: Date): string {
  return new Intl.DateTimeFormat(intl(locale), { month: "long", year: "numeric" }).format(d);
}

export function weekdayLabels(locale: string): string[] {
  const f = new Intl.DateTimeFormat(intl(locale), { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i)));
}

export function shortDate(locale: string, iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(intl(locale), { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function localParts(iso: string, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}
