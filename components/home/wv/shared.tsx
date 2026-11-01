"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCompany } from "@/components/company/CompanyProvider";
import { WED_BLUR } from "../wedding-blur";

export const ORDER = [7, 10, 5, 8, 6, 9, 1, 2, 3, 4];
export const SRC = ORDER.map((id) => `/wed-${id}.webp`);
export const BLUR = ORDER.map((id) => WED_BLUR[id]);
export const EASE = [0.22, 1, 0.36, 1] as const;

export function Rings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <circle cx="12.5" cy="14" r="7.5" />
      <circle cx="21.5" cy="14" r="7.5" />
      <path d="M21.5 1.2 24 4l-2.5 2.6L19 4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function useWedding() {
  const t = useTranslations("WeddingCars");
  const company = useCompany();
  const roles = t.raw("roles") as string[];
  const wa = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(t("waText", { roles: roles.join(", ") }))}`;
  return { t, wa, phone: company.phones[0] };
}

export function useAuto(count: number, ms: number, run: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % count), ms);
    return () => window.clearTimeout(id);
  }, [i, run, count, ms]);
  return [i, (n: number) => setI(((n % count) + count) % count)] as const;
}
