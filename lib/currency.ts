export const BAM_PER_EUR = 1.95583; // fixed legal peg (1 EUR = 1.95583 KM)

export type Currency = "BAM" | "EUR";

/** Convert a BAM amount to the target currency. */
export function convertFromBam(bam: number, to: Currency): number {
  return to === "EUR" ? bam / BAM_PER_EUR : bam;
}

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
