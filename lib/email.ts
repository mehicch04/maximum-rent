import { Resend } from "resend";
import type { InquiryInput } from "@/lib/validations";
import { SITE } from "@/lib/site-config";
import {
  contactRequestHtml,
  ownerInquiryHtml,
  guestConfirmationHtml,
  guestSubject,
  decisionHtml,
  toLang,
  type GuestLang,
} from "@/lib/email-templates";

export type ExtraLine = {
  nameHr: string;
  nameEn: string;
  pricing: "PER_DAY" | "PER_RENTAL" | "INCLUDED";
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

type InquiryEmailData = Omit<InquiryInput, "extras"> & {
  reference: string;
  extras?: ExtraLine[];
  days?: number;
  pricePerDay?: number | null;
  pickupLocationName?: string | null;
  returnLocationName?: string | null;
};

const FMT_LOCALE = { HR: "hr-HR", EN: "en-GB", DE: "de-DE", ES: "es-ES" } as const;

function fmt(iso: string, locale: GuestLang = "HR"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(FMT_LOCALE[locale], {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: locale === "HR" ? "2-digit" : "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function esc(v?: string | null): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendInquiryEmail(
  data: InquiryEmailData,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL ?? "info@maximum-rent.com";
  const from =
    process.env.INQUIRY_FROM_EMAIL ?? "Maximum Rent <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY missing — inquiry stored, notification email skipped.",
    );
    return { sent: false, error: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const guestLocale = toLang(data.locale);

  const html = ownerInquiryHtml({
    ref: esc(data.reference),
    vehicle: esc(data.carTitle),
    pickupDateTime: fmt(data.pickupAt),
    dropoffDateTime: fmt(data.returnAt),
    pickupLocation: esc(data.pickupLocationName) || "&mdash;",
    dropoffLocation: esc(data.returnLocationName) || "&mdash;",
    guestName: esc(`${data.firstName} ${data.lastName}`),
    guestEmail: esc(data.email),
    guestPhone: esc(data.phone),
    flightNumber: esc(data.flightNumber),
    note: esc(data.message),
    extras: data.extras ?? [],
    days: data.days ?? 1,
    pricePerDay: data.pricePerDay ?? null,
    currency: data.currency ?? "BAM",
    guestLocale,
  });

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `${guestLocale === "HR" ? "" : `[${guestLocale}] `}Novi upit · ${data.reference} · ${data.carTitle}`,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { sent: false, error: String(error) };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { sent: false, error: "send_failed" };
  }
}

export async function sendGuestConfirmationEmail(
  data: InquiryEmailData,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.INQUIRY_FROM_EMAIL ?? "Maximum Rent <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY missing — guest confirmation skipped.",
    );
    return { sent: false, error: "missing_api_key" };
  }

  const locale = toLang(data.locale);
  const resend = new Resend(apiKey);

  const dot = " &middot; ";
  const html = guestConfirmationHtml(
    {
      ref: esc(data.reference),
      vehicle: esc(data.carTitle),
      guestFirstName: esc(data.firstName),
      pickupLine:
        fmt(data.pickupAt, locale) +
        (data.pickupLocationName ? dot + esc(data.pickupLocationName) : ""),
      dropoffLine:
        fmt(data.returnAt, locale) +
        (data.returnLocationName ? dot + esc(data.returnLocationName) : ""),
      agencyPhone: esc(SITE.phones[0]?.value ?? ""),
      agencyEmail: esc(SITE.email),
      agencyAddress: esc(SITE.name),
      extras: data.extras ?? [],
      days: data.days ?? 1,
      pricePerDay: data.pricePerDay ?? null,
      currency: data.currency ?? "BAM",
    },
    locale,
  );

  const subject = guestSubject(locale, data.reference);

  try {
    const { error } = await resend.emails.send({
      from,
      to: data.email,
      replyTo: process.env.INQUIRY_TO_EMAIL ?? SITE.email,
      subject,
      html,
    });
    if (error) {
      console.error("[email] guest confirmation error:", error);
      return { sent: false, error: String(error) };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] guest confirmation failed:", err);
    return { sent: false, error: "send_failed" };
  }
}

export type ContactEmailData = {
  reference: string;
  type: "CONTACT" | "BUSINESS";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string | null;
  message?: string | null;
  locale?: "hr" | "en" | string;
};

export async function sendContactEmail(
  data: ContactEmailData,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL ?? SITE.email;
  const from =
    process.env.INQUIRY_FROM_EMAIL ?? "Maximum Rent <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY missing — contact email skipped.");
    return { sent: false, error: "missing_api_key" };
  }

  const isBusiness = data.type === "BUSINESS";
  const lang = toLang(data.locale);
  const resend = new Resend(apiKey);

  const html = contactRequestHtml({
    ref: esc(data.reference),
    kind: isBusiness ? "Poslovna ponuda" : "Kontakt",
    name: esc(`${data.firstName} ${data.lastName}`),
    email: esc(data.email),
    phone: esc(data.phone),
    company: esc(data.company),
    message: esc(data.message),
    guestLocale: lang,
  });

  const subject =
    `${lang === "HR" ? "" : `[${lang}] `}${isBusiness ? "Poslovni upit" : "Nova poruka"}` +
    ` · ${data.reference} · ${data.firstName} ${data.lastName}`;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject,
      html,
    });
    if (error) {
      console.error("[email] contact error:", error);
      return { sent: false, error: String(error) };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] contact send failed:", err);
    return { sent: false, error: "send_failed" };
  }
}

type DecisionInquiry = {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  pickupAt: Date;
  returnAt: Date;
  locale: GuestLang;
  carTitle: string | null;
};

const TZ = "Europe/Sarajevo";
function fmtTz(d: Date, locale: GuestLang): string {
  return new Intl.DateTimeFormat(FMT_LOCALE[locale] ?? FMT_LOCALE.HR, {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const DECISION_COPY = {
  HR: {
    confirmedSubject: (ref: string) => `Rezervacija potvrđena ✔ (${ref})`,
    cancelledSubject: (ref: string) => `Rezervacija nije potvrđena (${ref})`,
    confirmedTitle: "Vaša rezervacija je potvrđena!",
    cancelledTitle: "Vaša rezervacija nažalost nije potvrđena",
    confirmedIntro:
      "s zadovoljstvom potvrđujemo vašu rezervaciju. Detalji su ispod, vidimo se!",
    cancelledIntro:
      "nažalost nismo u mogućnosti potvrditi vašu rezervaciju za traženi period.",
    car: "Vozilo",
    period: "Period",
    reference: "Referenca",
    contact: "Kontakt",
    footer: "Maximum Rent a Car · Hercegovina",
    greeting: (name: string) => `Pozdrav ${name},`,
    confirmedNotice:
      '<strong style="color:#111111;">Vozilo je rezervirano</strong> za navedeni period. Molimo ponesite važeću vozačku dozvolu i osobni dokument pri preuzimanju.',
    cancelledNotice:
      '<strong style="color:#111111;">Rezervacija nije potvrđena.</strong> Slobodno nas kontaktirajte, rado ćemo pronaći alternativni termin ili vozilo.',
    confirmedPre: (ref: string) => `Rezervacija ${ref} je potvrđena.`,
    cancelledPre: (ref: string) => `Rezervacija ${ref} nije potvrđena.`,
  },
  EN: {
    confirmedSubject: (ref: string) => `Reservation confirmed ✔ (${ref})`,
    cancelledSubject: (ref: string) => `Reservation not confirmed (${ref})`,
    confirmedTitle: "Your reservation is confirmed!",
    cancelledTitle: "Unfortunately, your reservation was not confirmed",
    confirmedIntro:
      "we're happy to confirm your reservation. Details are below, see you soon!",
    cancelledIntro:
      "unfortunately we are unable to confirm your reservation for the requested period.",
    car: "Vehicle",
    period: "Period",
    reference: "Reference",
    contact: "Contact",
    footer: "Maximum Rent a Car · Herzegovina",
    greeting: (name: string) => `Dear ${name},`,
    confirmedNotice:
      '<strong style="color:#111111;">Your vehicle is reserved</strong> for the selected period. Please bring a valid driving licence and ID at pick-up.',
    cancelledNotice:
      '<strong style="color:#111111;">The reservation was not confirmed.</strong> Feel free to contact us and we will gladly find an alternative date or vehicle.',
    confirmedPre: (ref: string) => `Reservation ${ref} is confirmed.`,
    cancelledPre: (ref: string) => `Reservation ${ref} was not confirmed.`,
  },
  DE: {
    confirmedSubject: (ref: string) => `Buchung bestätigt ✔ (${ref})`,
    cancelledSubject: (ref: string) => `Buchung nicht bestätigt (${ref})`,
    confirmedTitle: "Ihre Buchung ist bestätigt!",
    cancelledTitle: "Ihre Buchung konnte leider nicht bestätigt werden",
    confirmedIntro:
      "wir freuen uns, Ihre Buchung zu bestätigen. Alle Details finden Sie unten, bis bald!",
    cancelledIntro:
      "leider können wir Ihre Buchung für den gewünschten Zeitraum nicht bestätigen.",
    car: "Fahrzeug",
    period: "Zeitraum",
    reference: "Referenz",
    contact: "Kontakt",
    footer: "Maximum Rent a Car · Herzegowina",
    greeting: (name: string) => `Hallo ${name},`,
    confirmedNotice:
      '<strong style="color:#111111;">Ihr Fahrzeug ist reserviert</strong> für den angegebenen Zeitraum. Bitte bringen Sie bei der Abholung einen gültigen Führerschein und Ausweis mit.',
    cancelledNotice:
      '<strong style="color:#111111;">Die Buchung wurde nicht bestätigt.</strong> Kontaktieren Sie uns gerne, wir finden gern einen anderen Termin oder ein anderes Fahrzeug.',
    confirmedPre: (ref: string) => `Buchung ${ref} ist bestätigt.`,
    cancelledPre: (ref: string) => `Buchung ${ref} wurde nicht bestätigt.`,
  },
  ES: {
    confirmedSubject: (ref: string) => `Reserva confirmada ✔ (${ref})`,
    cancelledSubject: (ref: string) => `Reserva no confirmada (${ref})`,
    confirmedTitle: "¡Tu reserva está confirmada!",
    cancelledTitle: "Lamentablemente, tu reserva no se ha confirmado",
    confirmedIntro:
      "nos alegra confirmar tu reserva. Tienes todos los detalles abajo, ¡hasta pronto!",
    cancelledIntro:
      "lamentablemente no podemos confirmar tu reserva para el periodo solicitado.",
    car: "Vehículo",
    period: "Periodo",
    reference: "Referencia",
    contact: "Contacto",
    footer: "Maximum Rent a Car · Herzegovina",
    greeting: (name: string) => `Hola ${name},`,
    confirmedNotice:
      '<strong style="color:#111111;">Tu vehículo está reservado</strong> para el periodo indicado. Trae un carné de conducir válido y tu documento de identidad al recogerlo.',
    cancelledNotice:
      '<strong style="color:#111111;">La reserva no se ha confirmado.</strong> Escríbenos y buscaremos con gusto otra fecha u otro vehículo.',
    confirmedPre: (ref: string) => `La reserva ${ref} está confirmada.`,
    cancelledPre: (ref: string) => `La reserva ${ref} no se ha confirmado.`,
  },
} as const;

export async function sendReservationDecisionEmail({
  inquiry,
  decision,
}: {
  inquiry: DecisionInquiry;
  decision: "CONFIRMED" | "CANCELLED";
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.INQUIRY_FROM_EMAIL ?? "Maximum Rent <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY missing — decision email skipped.");
    return { sent: false, error: "missing_api_key" };
  }

  const c = DECISION_COPY[inquiry.locale] ?? DECISION_COPY.HR;
  const confirmed = decision === "CONFIRMED";
  const name = `${inquiry.firstName} ${inquiry.lastName}`;
  const locale = inquiry.locale;

  const html = decisionHtml(
    {
      ref: esc(inquiry.reference),
      vehicle: esc(inquiry.carTitle),
      pickupLine: fmtTz(inquiry.pickupAt, locale),
      dropoffLine: fmtTz(inquiry.returnAt, locale),
      agencyPhone: esc(SITE.phones[0]?.value ?? ""),
      agencyEmail: esc(SITE.email),
      agencyAddress: esc(SITE.name),
      title: confirmed ? c.confirmedTitle : c.cancelledTitle,
      greeting: c.greeting(esc(name)),
      intro: confirmed ? c.confirmedIntro : c.cancelledIntro,
      notice: confirmed ? c.confirmedNotice : c.cancelledNotice,
      preheader: confirmed
        ? c.confirmedPre(esc(inquiry.reference))
        : c.cancelledPre(esc(inquiry.reference)),
      accent: confirmed ? "#16a34a" : "#E30613",
    },
    locale,
  );

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: inquiry.email,
      subject: confirmed
        ? c.confirmedSubject(inquiry.reference)
        : c.cancelledSubject(inquiry.reference),
      html,
    });
    if (error) {
      console.error("[email] decision send error:", error);
      return { sent: false, error: String(error) };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] decision send failed:", err);
    return { sent: false, error: "send_failed" };
  }
}
