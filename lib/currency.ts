const BAM_PER_EUR = 1.95583;

export type Currency = "BAM" | "EUR";

function convertFromBam(bam: number, to: Currency): number {
  return to === "EUR" ? bam / BAM_PER_EUR : bam;
}

export function displayAmount(bam: number, currency: Currency): number {
  return Math.round(convertFromBam(bam, currency));
}

export function currencySymbol(currency: Currency): string {
  return currency === "EUR" ? "€" : "KM";
}

export function formatPrice(bam: number, currency: Currency): string {
  return `${displayAmount(bam, currency)} ${currencySymbol(currency)}`;
}
