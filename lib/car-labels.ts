import type { Car } from "@prisma/client";
import type { AppLocale } from "@/i18n/routing";

type Label = Record<AppLocale, string>;

export const CLASS_LABELS: Record<Car["carClass"], Label> = {
  CITY_CAR: { hr: "City car", en: "City car", de: "Kleinwagen", es: "Urbano" },
  ECONOMY: { hr: "Ekonomična", en: "Economy", de: "Economy", es: "Económico" },
  COMPACT: { hr: "Kompaktna", en: "Compact", de: "Kompaktklasse", es: "Compacto" },
  MIDSIZE: { hr: "Srednja klasa", en: "Midsize", de: "Mittelklasse", es: "Mediano" },
  FULLSIZE: { hr: "Velika klasa", en: "Full-size", de: "Oberklasse", es: "Grande" },
  LUXURY: { hr: "Luksuzna", en: "Luxury", de: "Luxusklasse", es: "Lujo" },
  SUV: { hr: "SUV", en: "SUV", de: "SUV", es: "SUV" },
  VAN: { hr: "Kombi", en: "Van", de: "Transporter", es: "Furgoneta" },
  MINIBUS: { hr: "Minibus", en: "Minibus", de: "Kleinbus", es: "Minibús" },
};

export const TRANSMISSION_LABELS: Record<Car["transmission"], Label> = {
  MANUAL: { hr: "Manualni", en: "Manual", de: "Schaltgetriebe", es: "Manual" },
  AUTOMATIC: { hr: "Automatik", en: "Automatic", de: "Automatik", es: "Automático" },
};

export const FUEL_LABELS: Record<Car["fuelType"], Label> = {
  PETROL: { hr: "Benzin", en: "Petrol", de: "Benzin", es: "Gasolina" },
  DIESEL: { hr: "Dizel", en: "Diesel", de: "Diesel", es: "Diésel" },
  HYBRID: { hr: "Hibrid", en: "Hybrid", de: "Hybrid", es: "Híbrido" },
  PLUG_IN_HYBRID: { hr: "Plug-in hibrid", en: "Plug-in hybrid", de: "Plug-in-Hybrid", es: "Híbrido enchufable" },
  ELECTRIC: { hr: "Električni", en: "Electric", de: "Elektro", es: "Eléctrico" },
};

export function label(map: Label, locale: AppLocale): string {
  return map[locale] ?? map.hr;
}
