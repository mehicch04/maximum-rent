import type { Car, Location } from "@prisma/client";
import type { AppLocale } from "@/i18n/routing";
import { SITE } from "@/lib/site-config";

export const WHATSAPP_NUMBER = SITE.whatsapp;
export const INQUIRY_EMAIL = SITE.email;

export type InquiryContext = {
  car: Pick<Car, "title"> | { title: string };
  pickupLocation?: Pick<Location, "name"> | null;
  returnLocation?: Pick<Location, "name"> | null;
  pickupAt?: Date | string | null;
  returnAt?: Date | string | null;
  locale?: AppLocale;
};

function formatDateTime(value?: Date | string | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Prefilled inquiry text — reused for both WhatsApp and email. */
export function buildInquiryMessage(ctx: InquiryContext): string {
  const car = ctx.car.title;
  const start = formatDateTime(ctx.pickupAt);
  const end = formatDateTime(ctx.returnAt);
  const pickup = ctx.pickupLocation?.name ?? "—";
  const ret = ctx.returnLocation?.name ?? pickup;

  if (ctx.locale === "en") {
    return (
      `Hello, I'm interested in renting the ${car} ` +
      `from ${start} to ${end}. ` +
      `Pick-up location: ${pickup}. Return location: ${ret}.`
    );
  }
  return (
    `Poštovani, zainteresiran/na sam za rezervaciju vozila ${car} ` +
    `od ${start} do ${end}. ` +
    `Lokacija preuzimanja: ${pickup}. Lokacija povrata: ${ret}.`
  );
}

export function buildWhatsAppUrl(
  ctx: InquiryContext,
  phone: string = WHATSAPP_NUMBER,
): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildInquiryMessage(ctx))}`;
}

export function buildMailtoUrl(
  ctx: InquiryContext,
  to: string = INQUIRY_EMAIL,
): string {
  const base = ctx.locale === "en" ? "Reservation inquiry" : "Upit za rezervaciju";
  const subject = encodeURIComponent(`${base}: ${ctx.car.title}`);
  const body = encodeURIComponent(buildInquiryMessage(ctx));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

// ---------------------------------------------------------------------------
// Owner notification (admin → WhatsApp forward of a new inquiry)
// ---------------------------------------------------------------------------

type OwnerSummary = {
  reference: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  phone: string;
  carTitle: string | null;
  pickupAt: Date;
  returnAt: Date;
};

function fmtSarajevo(d: Date): string {
  return new Intl.DateTimeFormat("hr-HR", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Short owner-facing summary of a new inquiry (plain text, HR). */
export function buildOwnerSummaryText(q: OwnerSummary): string {
  return (
    `🚗 Novi upit (${q.reference})\n` +
    `Poslano: ${fmtSarajevo(q.createdAt)}\n` +
    `Klijent: ${q.firstName} ${q.lastName} · ${q.phone}\n` +
    `Vozilo: ${q.carTitle ?? "—"}\n` +
    `Period: ${fmtSarajevo(q.pickupAt)} → ${fmtSarajevo(q.returnAt)}`
  );
}
