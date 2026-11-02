"use client";

import { useCurrency } from "./CurrencyProvider";
import { formatPrice } from "@/lib/currency";

export function Price({
  bam,
  className,
}: {
  bam: number;
  className?: string;
}) {
  const { currency } = useCurrency();
  return <span className={className}>{formatPrice(bam, currency)}</span>;
}
