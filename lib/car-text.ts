type Described = {
  descriptionHr?: string | null;
  descriptionEn?: string | null;
  descriptionDe?: string | null;
  descriptionEs?: string | null;
};

const clean = (v?: string | null) => (v && v.trim() ? v.trim() : null);

export function carDescription(car: Described, locale: string): string | null {
  const hr = clean(car.descriptionHr);
  const en = clean(car.descriptionEn);
  if (locale === "hr") return hr ?? en;
  if (locale === "de") return clean(car.descriptionDe) ?? en ?? hr;
  if (locale === "es") return clean(car.descriptionEs) ?? en ?? hr;
  return en ?? hr;
}
