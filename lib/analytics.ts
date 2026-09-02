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
