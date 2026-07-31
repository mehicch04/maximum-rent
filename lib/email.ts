import { Resend } from "resend";
import type { InquiryInput } from "@/lib/validations";
import { SITE } from "@/lib/site-config";
import {
  ownerInquiryHtml,
  guestConfirmationHtml,
} from "@/lib/email-templates";

type InquiryEmailData = InquiryInput & {
  reference: string;
  pickupLocationName?: string | null;
  returnLocationName?: string | null;
};

function fmt(iso: string, locale: "HR" | "EN" = "HR"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "EN" ? "en-GB" : "hr-HR", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: locale === "EN" ? "short" : "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Escapes user-supplied text before it goes into the HTML email. */
function esc(v?: string | null): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value?: string | null): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 0;color:#888;font-size:13px;width:170px;vertical-align:top">${label}</td>
    <td style="padding:8px 0;color:#111;font-size:14px;font-weight:600">${value}</td>
  </tr>`;
}

/**
 * Sends the inquiry notification to the business inbox.
 * Returns { sent:false } (instead of throwing) when RESEND_API_KEY is absent,
 * so local development works without email configured.
 */
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
  const guestLocale: "HR" | "EN" = data.locale === "en" ? "EN" : "HR";

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
    guestLocale,
  });

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `${guestLocale === "EN" ? "[EN] " : ""}Novi upit · ${data.reference} · ${data.carTitle}`,
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

// ---------------------------------------------------------------------------
// Confirmation email → GUEST (sent right after they submit an inquiry)
// ---------------------------------------------------------------------------

/**
 * Tells the guest we received their inquiry, in the language they browsed in.
 *
 * This is NOT a booking confirmation — the copy makes clear the agency still
 * has to confirm. Non-fatal: a failure here never blocks storing the inquiry.
 */
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

  const locale: "HR" | "EN" = data.locale === "en" ? "EN" : "HR";
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
    },
    locale,
  );

  const subject =
    locale === "EN"
      ? `We received your inquiry · ${data.reference}`
      : `Zaprimili smo vaš upit · ${data.reference}`;

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

// ---------------------------------------------------------------------------
// Reservation decision email → CLIENT (sent when the agency confirms/cancels)
// ---------------------------------------------------------------------------

type DecisionInquiry = {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  pickupAt: Date;
  returnAt: Date;
  locale: "HR" | "EN";
  carTitle: string | null;
};

const TZ = "Europe/Sarajevo";
function fmtTz(d: Date, locale: "HR" | "EN"): string {
  return new Intl.DateTimeFormat(locale === "EN" ? "en-GB" : "hr-HR", {
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
    confirmedIntro: (name: string) =>
      `Poštovani/a ${name}, s zadovoljstvom potvrđujemo vašu rezervaciju. Detalji su ispod — vidimo se!`,
    cancelledIntro: (name: string) =>
      `Poštovani/a ${name}, nažalost nismo u mogućnosti potvrditi vašu rezervaciju za traženi period. Slobodno nas kontaktirajte — rado ćemo pronaći alternativni termin ili vozilo.`,
    car: "Vozilo",
    period: "Period",
    reference: "Referenca",
    contact: "Kontakt",
    footer: "Maximum Rent a Car · Hercegovina",
  },
  EN: {
    confirmedSubject: (ref: string) => `Reservation confirmed ✔ (${ref})`,
    cancelledSubject: (ref: string) => `Reservation not confirmed (${ref})`,
    confirmedTitle: "Your reservation is confirmed!",
    cancelledTitle: "Unfortunately, your reservation was not confirmed",
    confirmedIntro: (name: string) =>
      `Dear ${name}, we're happy to confirm your reservation. Details below — see you soon!`,
    cancelledIntro: (name: string) =>
      `Dear ${name}, unfortunately we are unable to confirm your reservation for the requested period. Feel free to contact us — we'll gladly find an alternative date or vehicle.`,
    car: "Vehicle",
    period: "Period",
    reference: "Reference",
    contact: "Contact",
    footer: "Maximum Rent a Car · Herzegovina",
  },
} as const;

/**
 * Notifies the client that the agency confirmed or cancelled their
 * reservation. Never throws — returns { sent:false } on any failure so the
 * admin action (status change) always succeeds regardless of email state.
 */
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
  const accent = confirmed ? "#16a34a" : "#E30613";

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
    <div style="background:#E30613;padding:20px 24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;color:#fff;font-size:18px;letter-spacing:.02em">Maximum Rent a Car</h1>
      <p style="margin:4px 0 0;color:#ffd7d9;font-size:13px">${c.reference}: ${inquiry.reference}</p>
    </div>
    <div style="border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px;padding:24px">
      <h2 style="margin:0 0 8px;color:${accent};font-size:17px">
        ${confirmed ? c.confirmedTitle : c.cancelledTitle}
      </h2>
      <p style="margin:0 0 16px;color:#444;font-size:14px;line-height:1.6">
        ${confirmed ? c.confirmedIntro(name) : c.cancelledIntro(name)}
      </p>
      <table style="width:100%;border-collapse:collapse">
        ${row(c.car, inquiry.carTitle)}
        ${row(c.period, `${fmtTz(inquiry.pickupAt, inquiry.locale)} → ${fmtTz(inquiry.returnAt, inquiry.locale)}`)}
        <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:8px"></td></tr>
        ${row(c.contact, `${"info@maximum-rent.com"} · +387 63 660 444 · WhatsApp +387 63 660 444`)}
      </table>
      <p style="margin:20px 0 0;color:#999;font-size:12px">${c.footer}</p>
    </div>
  </div>`;

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
