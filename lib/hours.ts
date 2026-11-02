const WORD: Record<string, string> = { hr: "do", en: "to", de: "bis", es: "a" };

export function formatHours(hours: string, locale: string): string {
  const m = hours.match(/(\d{1,2}[:.]\d{2})\s*(?:h|Uhr)?\s*[–—-]\s*(\d{1,2}[:.]\d{2})/i);
  if (!m) return hours.replace(/\s*[–—]\s*/g, ", ");
  const word = WORD[locale] ?? WORD.hr;
  const tail = locale === "de" ? " Uhr" : locale === "hr" ? "h" : "";
  return `${m[1]} ${word} ${m[2]}${tail}`;
}

export function tidyName(name: string): string {
  return name.replace(/\s+[–—-]\s+/g, ", ");
}
