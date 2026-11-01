import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hr", "en", "de", "es"],
  defaultLocale: "hr",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_NAMES: Record<AppLocale, string> = {
  hr: "Hrvatski",
  en: "English",
  de: "Deutsch",
  es: "Español",
};

export const LOCALE_FLAG: Record<AppLocale, string> = { hr: "hr", en: "gb", de: "de", es: "es" };

const INTL: Record<AppLocale, string> = { hr: "hr-HR", en: "en-GB", de: "de-DE", es: "es-ES" };

export function intlLocale(locale: string): string {
  return INTL[locale as AppLocale] ?? INTL.hr;
}
