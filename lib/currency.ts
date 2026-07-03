/**
 * Currency handling for the site.
 *
 * Prices are ALWAYS stored in BAM (the owner enters marke in the admin).
 * The Bosnian mark is pegged to the euro by law at a fixed rate, so no live
 * exchange rate / API is ever needed — the conversion is a constant.
 */
export const BAM_PER_EUR = 1.95583; // fixed legal peg (1 EUR = 1.95583 KM)

export type Currency = "BAM" | "EUR";

/** Convert a BAM amount to the target currency. */
export function convertFromBam(bam: number, to: Currency): number {
  return to === "EUR" ? bam / BAM_PER_EUR : bam;
}

/** Clean, rounded value for display (whole units — e.g. 110 KM, 56 €). */
export function displayAmount(bam: number, currency: Currency): number {
  return Math.round(convertFromBam(bam, currency));
}

export function currencySymbol(currency: Currency): string {
  return currency === "EUR" ? "€" : "KM";
}

/** e.g. formatPrice(110, "EUR") -> "56 €" ; formatPrice(110, "BAM") -> "110 KM" */
export function formatPrice(bam: number, currency: Currency): string {
  return `${displayAmount(bam, currency)} ${currencySymbol(currency)}`;
}
