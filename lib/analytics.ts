/**
 * Figures for the analytics screen.
 *
 * Everything here is placeholder data, deliberately kept behind one function
 * with a stable shape. When the real queries land, only the body of
 * `getAnalytics` changes — the page and the cards stay untouched.
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

/** What each period is compared against, so the trend arrow means something. */
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
  /** Percentage change against the previous period; null hides the indicator. */
  change: number | null;
  /** Set when a falling number is the good outcome (cancellations). */
  lowerIsBetter?: boolean;
  hint?: string;
};

export type Analytics = {
  range: Range;
  kpis: Kpi[];
};

const MOCK: Record<Range, Kpi[]> = {
  today: [
    { key: "utilisation", label: "Iskoristivost flote", value: "63 %", change: 4, hint: "22 od 35 vozila izdato" },
    { key: "revenue", label: "Ukupan prihod", value: "1.840 KM", change: 12, hint: "najam i dodatna oprema" },
    { key: "active", label: "Aktivni najmovi", value: "22", change: 2, hint: "vozila trenutno kod gostiju" },
    { key: "upcoming", label: "Nadolazeće rezervacije", value: "5", change: -1, hint: "potvrđene, još nisu preuzete" },
    { key: "duration", label: "Prosječno trajanje najma", value: "4,2 dana", change: 0, hint: "po potvrđenoj rezervaciji" },
    { key: "cancelled", label: "Stopa otkazivanja", value: "6 %", change: -2, lowerIsBetter: true, hint: "otkazane od svih upita" },
  ],
  "7d": [
    { key: "utilisation", label: "Iskoristivost flote", value: "71 %", change: 8, hint: "prosjek za period" },
    { key: "revenue", label: "Ukupan prihod", value: "14.260 KM", change: 18, hint: "najam i dodatna oprema" },
    { key: "active", label: "Aktivni najmovi", value: "25", change: 5, hint: "vozila trenutno kod gostiju" },
    { key: "upcoming", label: "Nadolazeće rezervacije", value: "18", change: 9, hint: "potvrđene, još nisu preuzete" },
    { key: "duration", label: "Prosječno trajanje najma", value: "4,8 dana", change: 3, hint: "po potvrđenoj rezervaciji" },
    { key: "cancelled", label: "Stopa otkazivanja", value: "8 %", change: 1, lowerIsBetter: true, hint: "otkazane od svih upita" },
  ],
  month: [
    { key: "utilisation", label: "Iskoristivost flote", value: "78 %", change: 11, hint: "prosjek za period" },
    { key: "revenue", label: "Ukupan prihod", value: "61.450 KM", change: 23, hint: "najam i dodatna oprema" },
    { key: "active", label: "Aktivni najmovi", value: "27", change: 6, hint: "vozila trenutno kod gostiju" },
    { key: "upcoming", label: "Nadolazeće rezervacije", value: "41", change: 14, hint: "potvrđene, još nisu preuzete" },
    { key: "duration", label: "Prosječno trajanje najma", value: "5,1 dana", change: 6, hint: "po potvrđenoj rezervaciji" },
    { key: "cancelled", label: "Stopa otkazivanja", value: "7 %", change: -3, lowerIsBetter: true, hint: "otkazane od svih upita" },
  ],
  year: [
    { key: "utilisation", label: "Iskoristivost flote", value: "69 %", change: 5, hint: "prosjek za period" },
    { key: "revenue", label: "Ukupan prihod", value: "487.900 KM", change: 16, hint: "najam i dodatna oprema" },
    { key: "active", label: "Aktivni najmovi", value: "22", change: null, hint: "vozila trenutno kod gostiju" },
    { key: "upcoming", label: "Nadolazeće rezervacije", value: "63", change: 21, hint: "potvrđene, još nisu preuzete" },
    { key: "duration", label: "Prosječno trajanje najma", value: "4,6 dana", change: -2, hint: "po potvrđenoj rezervaciji" },
    { key: "cancelled", label: "Stopa otkazivanja", value: "9 %", change: -1, lowerIsBetter: true, hint: "otkazane od svih upita" },
  ],
};

export function getAnalytics(range: Range): Analytics {
  return { range, kpis: MOCK[range] ?? MOCK.month };
}

export function isRange(v: unknown): v is Range {
  return typeof v === "string" && ["today", "7d", "month", "year"].includes(v);
}

// ---------------------------------------------------------------------------
// Trend, fleet status, top vehicles and extras
// ---------------------------------------------------------------------------

export type TrendPoint = {
  /** Short axis label: an hour, a weekday, a date or a month. */
  label: string;
  bookings: number;
  /** Revenue in BAM for that point. */
  revenue: number;
};

export type FleetSlice = { key: string; label: string; count: number; color: string };

export type TopCar = {
  title: string;
  rentals: number;
  revenue: number;
};

export type ExtraStat = {
  name: string;
  rented: number;
  stock: number;
};

/** Buckets differ per period so the axis never turns into a wall of labels. */
const TREND: Record<Range, TrendPoint[]> = {
  today: [
    { label: "08h", bookings: 1, revenue: 240 },
    { label: "10h", bookings: 2, revenue: 430 },
    { label: "12h", bookings: 1, revenue: 180 },
    { label: "14h", bookings: 3, revenue: 520 },
    { label: "16h", bookings: 2, revenue: 310 },
    { label: "18h", bookings: 1, revenue: 160 },
  ],
  "7d": [
    { label: "Pon", bookings: 6, revenue: 1620 },
    { label: "Uto", bookings: 4, revenue: 1180 },
    { label: "Sri", bookings: 7, revenue: 2040 },
    { label: "Čet", bookings: 5, revenue: 1490 },
    { label: "Pet", bookings: 11, revenue: 3260 },
    { label: "Sub", bookings: 13, revenue: 3410 },
    { label: "Ned", bookings: 5, revenue: 1260 },
  ],
  month: [
    { label: "1–7", bookings: 38, revenue: 12900 },
    { label: "8–14", bookings: 44, revenue: 15300 },
    { label: "15–21", bookings: 51, revenue: 17800 },
    { label: "22–28", bookings: 46, revenue: 15450 },
  ],
  year: [
    { label: "Jan", bookings: 62, revenue: 18400 },
    { label: "Feb", bookings: 58, revenue: 17100 },
    { label: "Mar", bookings: 74, revenue: 22600 },
    { label: "Apr", bookings: 96, revenue: 31200 },
    { label: "Maj", bookings: 128, revenue: 43800 },
    { label: "Jun", bookings: 164, revenue: 58900 },
    { label: "Jul", bookings: 198, revenue: 74200 },
    { label: "Avg", bookings: 205, revenue: 78600 },
    { label: "Sep", bookings: 151, revenue: 54300 },
    { label: "Okt", bookings: 104, revenue: 34700 },
    { label: "Nov", bookings: 71, revenue: 21900 },
    { label: "Dec", bookings: 66, revenue: 20300 },
  ],
};

/** Fleet status is a snapshot, so it does not depend on the selected period. */
export const FLEET_STATUS: FleetSlice[] = [
  { key: "rented", label: "U najmu", count: 22, color: "var(--chart-rented)" },
  { key: "available", label: "Dostupno", count: 9, color: "var(--chart-available)" },
  { key: "service", label: "Na servisu", count: 4, color: "var(--chart-service)" },
];

const TOP_CARS: Record<Range, TopCar[]> = {
  today: [
    { title: "Audi Q5 40 TDI", rentals: 2, revenue: 620 },
    { title: "VW T-Roc R-Line", rentals: 2, revenue: 480 },
    { title: "Škoda Octavia (2025)", rentals: 3, revenue: 450 },
    { title: "Audi A6 (2025)", rentals: 1, revenue: 190 },
    { title: "VW Transporter (8+1)", rentals: 1, revenue: 100 },
  ],
  "7d": [
    { title: "Škoda Octavia (2025)", rentals: 14, revenue: 4620 },
    { title: "Audi Q5 40 TDI", rentals: 9, revenue: 4180 },
    { title: "VW T-Roc R-Line", rentals: 11, revenue: 3450 },
    { title: "Audi A6 (2025)", rentals: 6, revenue: 2340 },
    { title: "VW Transporter (8+1)", rentals: 5, revenue: 1870 },
  ],
  month: [
    { title: "Škoda Octavia (2025)", rentals: 58, revenue: 19400 },
    { title: "Audi Q5 40 TDI", rentals: 41, revenue: 17650 },
    { title: "VW T-Roc R-Line", rentals: 47, revenue: 14900 },
    { title: "Audi A8 Long", rentals: 18, revenue: 12300 },
    { title: "VW Transporter (8+1)", rentals: 24, revenue: 8760 },
  ],
  year: [
    { title: "Škoda Octavia (2025)", rentals: 412, revenue: 138500 },
    { title: "Audi Q5 40 TDI", rentals: 296, revenue: 121300 },
    { title: "VW T-Roc R-Line", rentals: 338, revenue: 104900 },
    { title: "Audi A8 Long", rentals: 121, revenue: 86400 },
    { title: "VW Transporter (8+1)", rentals: 175, revenue: 62800 },
  ],
};

export const EXTRAS_STATS: ExtraStat[] = [
  { name: "Dječija sjedalica", rented: 7, stock: 10 },
  { name: "Booster sjedalica", rented: 4, stock: 8 },
  { name: "GPS navigacija", rented: 5, stock: 6 },
  { name: "Krovni nosač", rented: 2, stock: 4 },
  { name: "Zimska oprema", rented: 3, stock: 12 },
];

export function getTrend(range: Range): TrendPoint[] {
  return TREND[range] ?? TREND.month;
}

export function getTopCars(range: Range): TopCar[] {
  return TOP_CARS[range] ?? TOP_CARS.month;
}
