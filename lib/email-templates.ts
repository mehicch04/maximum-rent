/**
 * HTML email templates (table-based, inline CSS — safe in Outlook/Gmail).
 *
 * Generated from the approved designs. Keep the table markup as-is: Outlook
 * renders through the Word engine and breaks div/flex layouts.
 */

/**
 * Builds a dialable tel: value. Numbers here are written like
 * "+387 (0) 63 660 444" — the bracketed 0 is the national trunk prefix and must
 * be dropped when the country code is used, otherwise the call fails.
 */
function telHref(phone: string): string {
  const digits = String(phone ?? "")
    .replace(/\([^)]*\)/g, "") // drop "(0)" and anything else in brackets
    .replace(/[^\d+]/g, "");
  // If the visitor typed a local number ("063 660 444") we leave it as-is:
  // guessing a country code would produce an unreachable number.
  return digits;
}

export type ExtraLine = {
  nameHr: string;
  nameEn: string;
  pricing: "PER_DAY" | "PER_RENTAL" | "INCLUDED";
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

/**
 * Price breakdown for the emails: the rental, then one line per chosen extra,
 * then the estimated total. Always labelled as an estimate — the agency
 * confirms the final figure, so the email must not read like an invoice.
 *
 * Returns "" when there is nothing to show at all.
 */
function priceBlock(
  extras: ExtraLine[],
  days: number,
  pricePerDay: number | null,
  locale: "HR" | "EN",
): string {
  const hasRental = pricePerDay != null && pricePerDay > 0;
  if (!hasRental && !extras.length) return "";

  const isEn = locale === "EN";
  const heading = isEn ? "Price breakdown" : "Pregled cijene";
  const included = isEn ? "Included" : "Uključeno";
  const dayWord = days === 1 ? (isEn ? "day" : "dan") : isEn ? "days" : "dana";
  const rentalLbl = isEn
    ? `Vehicle rental &middot; ${days} ${dayWord}`
    : `Najam vozila &middot; ${days} ${dayWord}`;
  const totalLbl = isEn ? "Estimated total" : "Procjena ukupno";
  const note = isEn
    ? "Approximate amount. The final price is confirmed with the booking."
    : "Okvirni iznos. Konačnu cijenu potvrđujemo uz rezervaciju.";

  const km = (n: number) => `${n.toFixed(0)} KM`;

  const line = (label: string, value: string, strong = false) => `<tr>
      <td style="padding:9px 0;border-bottom:1px solid #eceef1;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${strong ? "#111111" : "#4b5563"};">${label}</td>
      <td align="right" style="padding:9px 0;border-bottom:1px solid #eceef1;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;font-weight:${strong ? "bold" : "normal"};white-space:nowrap;">${value}</td>
    </tr>`;

  const rentalTotal = hasRental ? pricePerDay! * days : 0;
  const rows =
    (hasRental ? line(rentalLbl, km(rentalTotal)) : "") +
    extras
      .map((e) => {
        const name = isEn ? e.nameEn : e.nameHr;
        const label = `${name}${e.qty > 1 ? ` &times; ${e.qty}` : ""}`;
        return e.pricing === "INCLUDED"
          ? line(label, `<span style="color:#127a3d;">${included}</span>`)
          : line(label, km(e.lineTotal));
      })
      .join("");

  const grand = rentalTotal + extras.reduce((a, e) => a + e.lineTotal, 0);
  const totalRow = `<tr>
      <td style="padding:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#111111;">${totalLbl}</td>
      <td align="right" style="padding:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;color:#E30613;white-space:nowrap;">${km(grand)}</td>
    </tr>`;

  return `<tr><td style="padding:20px 32px 0 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;">
    <tr><td style="padding:14px 24px 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">${heading}</td></tr>
    <tr><td style="padding:6px 24px 0 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}${totalRow}</table>
    </td></tr>
    <tr><td style="padding:10px 24px 16px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">${note}</td></tr>
    </table>
  </td></tr>`;
}

export type OwnerInquiryVars = {
  ref: string;
  vehicle: string;
  pickupDateTime: string;
  dropoffDateTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  flightNumber: string;
  note: string;
  /** "HR" | "EN" — the language the guest browsed the site in. */
  guestLocale: "HR" | "EN";
  extras?: ExtraLine[];
  days?: number;
  pricePerDay?: number | null;
};

export type GuestConfirmationVars = {
  extras?: ExtraLine[];
  days?: number;
  pricePerDay?: number | null;
  ref: string;
  vehicle: string;
  guestFirstName: string;
  pickupLine: string;
  dropoffLine: string;
  agencyPhone: string;
  agencyEmail: string;
  agencyAddress: string;
};

/** Owner notification — always in Croatian, with a badge showing the guest's language. */
export type ContactRequestVars = {
  ref: string;
  kind: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  guestLocale: "HR" | "EN";
};

/**
 * Message from the contact page or the business-offer page, sent to the owner.
 * Same shell as the inquiry email so the inbox looks consistent.
 */
export function contactRequestHtml(v: ContactRequestVars): string {
  const isEn = v.guestLocale === "EN";
  const langColor = isEn ? "#E30613" : "#111111";
  const langBadge = isEn ? "EN &middot; ENGLISH" : "HR &middot; HRVATSKI";
  const langPrefix = isEn ? "EN" : "HR";
  const langNote = isEn
    ? "Poruka je poslana s engleske verzije stranice &mdash; o\u010dekujte komunikaciju na engleskom."
    : "Poruka je poslana s hrvatske verzije stranice.";

  const row = (label: string, value: string) =>
    value
      ? `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#6b7280;width:40%;">${label}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${value}</td>
         </tr>`
      : "";

  const messageBlock = v.message
    ? `<tr><td style="padding:20px 32px 0 32px;" class="px">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;">
         <tr><td style="padding:14px 24px 4px 24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">Poruka</td></tr>
         <tr><td style="padding:0 24px 14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#111111;">${v.message}</td></tr>
         </table>
       </td></tr>`
    : "";

  return `<!doctype html>
<html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@media only screen and (max-width:620px){.px{padding-left:20px !important;padding-right:20px !important}.stack-right{display:block !important;width:100% !important;text-align:left !important;padding-top:14px !important}}</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${langPrefix} &middot; ${v.kind} &mdash; ${v.name}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;background-color:#ffffff;">

  <tr><td style="background-color:#E30613;padding:22px 32px;" class="px">
    <span style="font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;color:#ffffff;letter-spacing:1px;">MAXIMUM</span>
    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#ffffff;letter-spacing:3px;"> RENT A CAR</span>
  </td></tr>

  <tr><td style="padding:32px 32px 0 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="left" valign="top">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">${v.kind}</td></tr>
        <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;color:#E30613;font-weight:bold;padding-top:2px;">${v.ref.slice(-8)}</td></tr>
        </table>
      </td>
      <td align="right" valign="top" class="stack-right">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border:2px solid ${langColor};padding:7px 13px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:16px;color:${langColor};font-weight:bold;letter-spacing:1px;white-space:nowrap;">${langBadge}</td></tr>
        </table>
      </td>
    </tr>
    <tr><td colspan="2" style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;color:#111111;font-weight:bold;padding-top:16px;">Nova poruka s web stranice</td></tr>
    <tr><td colspan="2" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;padding-top:4px;">${langNote}</td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:22px 32px 0 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${row("Ime i prezime", v.name)}
      ${row("Firma", v.company)}
      ${row("Email", `<a href="mailto:${v.email}" style="color:#E30613;text-decoration:underline;">${v.email}</a>`)}
      ${row("Telefon", `<a href="tel:${telHref(v.phone)}" style="color:#E30613;text-decoration:underline;">${v.phone}</a>`)}
    </table>
  </td></tr>

  ${messageBlock}

  <tr><td style="padding:24px 32px 32px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background-color:#E30613;">
      <a href="mailto:${v.email}?subject=${encodeURIComponent(`Odgovor na va\u0161 upit \u2014 Maximum Rent a Car`)}" style="display:block;padding:12px 30px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#ffffff;font-weight:bold;text-decoration:none;">Odgovori emailom</a>
    </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 32px 28px 32px;" class="px">
    <div style="border-top:1px solid #e5e7eb;padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">
      Automatska poruka s web stranice Maximum Rent a Car.
    </div>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export function ownerInquiryHtml(v: OwnerInquiryVars): string {
  const isEn = v.guestLocale === "EN";

  // The badge makes English inquiries stand out at a glance (brand red),
  // while routine Croatian ones stay neutral.
  const langColor = isEn ? "#E30613" : "#111111";
  const langBadge = isEn ? "EN &middot; ENGLISH" : "HR &middot; HRVATSKI";
  const langPrefix = isEn ? "EN" : "HR";
  const languageRow = isEn ? "EN &mdash; engleski" : "HR &mdash; hrvatski";
  const langNote = isEn
    ? "Gost je poslao upit na engleskoj verziji stranice &mdash; o\u010dekujte komunikaciju na engleskom."
    : "Gost je poslao upit na hrvatskoj verziji stranice.";

  const note = v.note?.trim() ?? "";
  const extrasHtml = priceBlock(v.extras ?? [], v.days ?? 1, v.pricePerDay ?? null, "HR");
  const noteBlock = note ? `    <!-- Note (optional block: remove entire <tr> if empty) -->
    <tr><td style="padding:20px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;">
      <tr><td style="padding:14px 24px 4px 24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">Napomena gosta</td></tr>
      <tr><td style="padding:0 24px 14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#111111;">${note}</td></tr>` : "";

  const flightNumber = v.flightNumber?.trim() || "&mdash;";

  return `<!DOCTYPE html>
<html lang="hr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Novi upit za rezervaciju</title>
<!--[if mso]>
<style type="text/css">
table {border-collapse:collapse;}
td {mso-line-height-rule:exactly;}
</style>
<![endif]-->
<style type="text/css">
@media only screen and (max-width:620px){
  .stack-right{display:block !important;width:100% !important;text-align:left !important;padding-top:14px !important;}
  .stack-right table{float:none !important;}
  .container{width:100% !important;}
  .px{padding-left:20px !important;padding-right:20px !important;}
  .stack{display:block !important;width:100% !important;}
  .stack-pad{padding-top:4px !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<!-- Preheader -->
<span style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${langPrefix} &middot; Novi upit ${v.ref} &mdash; ${v.vehicle}</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;">

  <!-- Header -->
  <tr><td style="background-color:#E30613;padding:22px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;color:#ffffff;font-weight:bold;letter-spacing:2px;">MAXIMUM</td>
      <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#ffd6d9;letter-spacing:3px;">RENT A CAR</td>
    </tr>
    </table>
  </td></tr>

  <!-- Body card -->
  <tr><td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

    <!-- Title + reference -->
    <tr><td style="padding:32px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="left" valign="top">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">Broj upita</td></tr>
          <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;color:#E30613;font-weight:bold;padding-top:2px;">${v.ref}</td></tr>
          </table>
        </td>
        <!-- Oznaka jezika gosta -->
        <td align="right" valign="top" class="stack-right">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="border:2px solid ${langColor};padding:7px 13px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:16px;color:${langColor};font-weight:bold;letter-spacing:1px;white-space:nowrap;">${langBadge}</td></tr>
          </table>
        </td>
      </tr>
      <tr><td colspan="2" style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;color:#111111;font-weight:bold;padding-top:16px;">Novi upit za rezervaciju</td></tr>
      <tr><td colspan="2" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;padding-top:4px;">${langNote}</td></tr>
      </table>
    </td></tr>

    <!-- Vehicle + period highlight -->
    <tr><td style="padding:24px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-top:2px solid #E30613;">
      <tr><td style="padding:20px 24px 6px 24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">Vozilo</td></tr>
      <tr><td style="padding:0 24px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:#111111;font-weight:bold;">${v.vehicle}</td></tr>
      <tr><td style="padding:16px 24px 20px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td class="stack" width="47%" style="font-family:Arial,Helvetica,sans-serif;vertical-align:top;">
            <div style="font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">Preuzimanje</div>
            <div style="font-size:15px;line-height:22px;color:#111111;font-weight:bold;padding-top:2px;">${v.pickupDateTime}</div>
          </td>
          <td class="stack" width="6%" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#E30613;vertical-align:bottom;">&rarr;</td>
          <td class="stack stack-pad" width="47%" style="font-family:Arial,Helvetica,sans-serif;vertical-align:top;">
            <div style="font-size:11px;line-height:16px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">Vra&#263;anje</div>
            <div style="font-size:15px;line-height:22px;color:#111111;font-weight:bold;padding-top:2px;">${v.dropoffDateTime}</div>
          </td>
        </tr>
        </table>
      </td></tr>
      </table>
    </td></tr>

    <!-- Detail rows -->
    <tr><td style="padding:24px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="180" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Lokacija preuzimanja</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.pickupLocation}</td>
      </tr>
      <tr>
        <td width="180" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Lokacija vra&#263;anja</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.dropoffLocation}</td>
      </tr>
      <tr>
        <td width="180" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Gost</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;font-weight:bold;">${v.guestName}</td>
      </tr>
      <tr>
        <td width="180" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Email</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;"><a href="mailto:${v.guestEmail}" style="color:#E30613;text-decoration:underline;">${v.guestEmail}</a></td>
      </tr>
      <tr>
        <td width="180" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Telefon</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;"><a href="tel:${telHref(v.guestPhone)}" style="color:#E30613;text-decoration:underline;">${v.guestPhone}</a></td>
      </tr>
      <tr>
        <td width="180" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Broj leta</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${flightNumber}</td>
      </tr>
      <tr>
        <td width="180" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Jezik gosta</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${languageRow}</td>
      </tr>
      </table>
    </td></tr>

${extrasHtml}${noteBlock}
      </table>
    </td></tr>

    <!-- CTA buttons -->
    <tr><td style="padding:28px 32px 32px 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#E30613" style="background-color:#E30613;">
          <a href="tel:${telHref(v.guestPhone)}" style="display:block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#ffffff;font-weight:bold;text-decoration:none;text-align:left;">Pozovi gosta</a>
        </td>
        <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
        <td style="border:2px solid #111111;">
          <a href="mailto:${v.guestEmail}?subject=${encodeURIComponent(`Upit ${v.ref} — Maximum Rent a Car`)}" style="display:block;padding:11px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#111111;font-weight:bold;text-decoration:none;text-align:left;">Odgovori emailom</a>
        </td>
      </tr>
      </table>
    </td></tr>

    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 32px 8px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7280;">Ova poruka je automatski generisana iz sistema Maximum Rent a Car nakon &scaron;to je gost poslao upit putem web stranice.</td></tr>
    <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">Maximum Rent a Car &middot; interna obavijest</td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

/** Guest confirmation ("inquiry received") — Croatian version. */
export function guestConfirmationHtmlHr(v: GuestConfirmationVars): string {
  const extrasHtml = priceBlock(v.extras ?? [], v.days ?? 1, v.pricePerDay ?? null, "HR");
  return `<!DOCTYPE html>
<html lang="hr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Va&scaron; upit je zaprimljen</title>
<!--[if mso]>
<style type="text/css">
table {border-collapse:collapse;}
td {mso-line-height-rule:exactly;}
</style>
<![endif]-->
<style type="text/css">
@media only screen and (max-width:620px){
  .container{width:100% !important;}
  .px{padding-left:20px !important;padding-right:20px !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<!-- Preheader -->
<span style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Zaprimili smo va&scaron; upit ${v.ref}. Javit &#263;emo vam se uskoro radi potvrde.</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;">

  <!-- Header -->
  <tr><td style="background-color:#E30613;padding:22px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;color:#ffffff;font-weight:bold;letter-spacing:2px;">MAXIMUM</td>
      <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#ffd6d9;letter-spacing:3px;">RENT A CAR</td>
    </tr>
    </table>
  </td></tr>

  <!-- Body card -->
  <tr><td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

    <!-- Title -->
    <tr><td style="padding:32px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#111111;font-weight:bold;">Va&scaron; upit je zaprimljen</td></tr>
      <tr><td style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">Po&scaron;tovani ${v.guestFirstName}</td></tr>
      <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">hvala vam na upitu. Uspje&scaron;no smo ga zaprimili i na&scaron; tim &#263;e vas <strong>kontaktirati u najkra&#263;em roku</strong> radi potvrde dostupnosti vozila i dogovora detalja.</td></tr>
      </table>
    </td></tr>

    <!-- Important notice -->
    <tr><td style="padding:20px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-top:2px solid #E30613;">
      <tr><td style="padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b7280;"><strong style="color:#111111;">Napomena:</strong> ovo jo&scaron; nije potvr&#273;ena rezervacija. Vozilo &#263;e biti rezervisano tek nakon &scaron;to vam na&scaron;a agencija potvrdi dostupnost.</td></tr>
      </table>
    </td></tr>

    <!-- Summary -->
    ${extrasHtml}
  <tr><td style="padding:24px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Broj upita</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#E30613;font-weight:bold;">${v.ref}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Vozilo</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;font-weight:bold;">${v.vehicle}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Preuzimanje</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.pickupLine}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Vra&#263;anje</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.dropoffLine}</td>
      </tr>
      </table>
    </td></tr>

    <!-- Agency contact -->
    <tr><td style="padding:28px 32px 32px 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;padding-bottom:8px;">Imate pitanje? Kontaktirajte nas</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:#111111;">
        Telefon: <a href="tel:${telHref(v.agencyPhone)}" style="color:#E30613;text-decoration:underline;">${v.agencyPhone}</a><br>
        Email: <a href="mailto:${v.agencyEmail}" style="color:#E30613;text-decoration:underline;">${v.agencyEmail}</a>
      </td></tr>
      </table>
    </td></tr>

    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 32px 8px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7280;">Ovaj email ste primili jer ste poslali upit putem web stranice Maximum Rent a Car.</td></tr>
    <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">${v.agencyAddress}</td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

/** Guest confirmation ("inquiry received") — English version. */
export function guestConfirmationHtmlEn(v: GuestConfirmationVars): string {
  const extrasHtml = priceBlock(v.extras ?? [], v.days ?? 1, v.pricePerDay ?? null, "EN");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>We received your inquiry</title>
<!--[if mso]>
<style type="text/css">
table {border-collapse:collapse;}
td {mso-line-height-rule:exactly;}
</style>
<![endif]-->
<style type="text/css">
@media only screen and (max-width:620px){
  .container{width:100% !important;}
  .px{padding-left:20px !important;padding-right:20px !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<!-- Preheader -->
<span style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">We received your inquiry ${v.ref}. Our team will contact you shortly to confirm.</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;">

  <!-- Header -->
  <tr><td style="background-color:#E30613;padding:22px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;color:#ffffff;font-weight:bold;letter-spacing:2px;">MAXIMUM</td>
      <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#ffd6d9;letter-spacing:3px;">RENT A CAR</td>
    </tr>
    </table>
  </td></tr>

  <!-- Body card -->
  <tr><td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

    <!-- Title -->
    <tr><td style="padding:32px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#111111;font-weight:bold;">We received your inquiry</td></tr>
      <tr><td style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">Dear ${v.guestFirstName}</td></tr>
      <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">thank you for your inquiry. It has been received successfully and our team will <strong>contact you shortly</strong> to confirm vehicle availability and arrange the details.</td></tr>
      </table>
    </td></tr>

    <!-- Important notice -->
    <tr><td style="padding:20px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-top:2px solid #E30613;">
      <tr><td style="padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b7280;"><strong style="color:#111111;">Please note:</strong> this is not a confirmed booking yet. Your vehicle will be reserved once our agency confirms availability.</td></tr>
      </table>
    </td></tr>

    <!-- Summary -->
    ${extrasHtml}
  <tr><td style="padding:24px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Inquiry no.</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#E30613;font-weight:bold;">${v.ref}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Vehicle</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;font-weight:bold;">${v.vehicle}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Pick-up</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.pickupLine}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Drop-off</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.dropoffLine}</td>
      </tr>
      </table>
    </td></tr>

    <!-- Agency contact -->
    <tr><td style="padding:28px 32px 32px 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;padding-bottom:8px;">Questions? Get in touch</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:#111111;">
        Phone: <a href="tel:${telHref(v.agencyPhone)}" style="color:#E30613;text-decoration:underline;">${v.agencyPhone}</a><br>
        Email: <a href="mailto:${v.agencyEmail}" style="color:#E30613;text-decoration:underline;">${v.agencyEmail}</a>
      </td></tr>
      </table>
    </td></tr>

    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 32px 8px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7280;">You are receiving this email because you submitted an inquiry on the Maximum Rent a Car website.</td></tr>
    <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">${v.agencyAddress}</td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

/** Picks the guest template that matches the language they browsed in. */
export function guestConfirmationHtml(
  v: GuestConfirmationVars,
  locale: "HR" | "EN",
): string {
  return locale === "EN" ? guestConfirmationHtmlEn(v) : guestConfirmationHtmlHr(v);
}


// ---------------------------------------------------------------------------
// Reservation decision (confirmed / cancelled) → guest
// ---------------------------------------------------------------------------

export type DecisionVars = {
  ref: string;
  vehicle: string;
  pickupLine: string;
  dropoffLine: string;
  agencyPhone: string;
  agencyEmail: string;
  agencyAddress: string;
  /** Copy varies by decision + language; supplied by lib/email.ts. */
  title: string;
  greeting: string;
  intro: string;
  notice: string;
  preheader: string;
  /** Accent rule above the notice: green when confirmed, brand red otherwise. */
  accent: string;
};

function decisionHtmlHr(v: DecisionVars): string {
  return `<!DOCTYPE html>
<html lang="hr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${v.title}</title>
<!--[if mso]>
<style type="text/css">
table {border-collapse:collapse;}
td {mso-line-height-rule:exactly;}
</style>
<![endif]-->
<style type="text/css">
@media only screen and (max-width:620px){
  .container{width:100% !important;}
  .px{padding-left:20px !important;padding-right:20px !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<!-- Preheader -->
<span style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${v.preheader}</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;">

  <!-- Header -->
  <tr><td style="background-color:#E30613;padding:22px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;color:#ffffff;font-weight:bold;letter-spacing:2px;">MAXIMUM</td>
      <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#ffd6d9;letter-spacing:3px;">RENT A CAR</td>
    </tr>
    </table>
  </td></tr>

  <!-- Body card -->
  <tr><td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

    <!-- Title -->
    <tr><td style="padding:32px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#111111;font-weight:bold;">${v.title}</td></tr>
      <tr><td style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">${v.greeting}</td></tr>
      <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">${v.intro}</td></tr>
      </table>
    </td></tr>

    <!-- Important notice -->
    <tr><td style="padding:20px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-top:2px solid ${v.accent};">
      <tr><td style="padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b7280;">${v.notice}</td></tr>
      </table>
    </td></tr>

    <!-- Summary -->
    <tr><td style="padding:24px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Broj upita</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#E30613;font-weight:bold;">${v.ref}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Vozilo</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;font-weight:bold;">${v.vehicle}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Preuzimanje</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.pickupLine}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Vra&#263;anje</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.dropoffLine}</td>
      </tr>
      </table>
    </td></tr>

    <!-- Agency contact -->
    <tr><td style="padding:28px 32px 32px 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;padding-bottom:8px;">Imate pitanje? Kontaktirajte nas</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:#111111;">
        Telefon: <a href="tel:${telHref(v.agencyPhone)}" style="color:#E30613;text-decoration:underline;">${v.agencyPhone}</a><br>
        Email: <a href="mailto:${v.agencyEmail}" style="color:#E30613;text-decoration:underline;">${v.agencyEmail}</a>
      </td></tr>
      </table>
    </td></tr>

    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 32px 8px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7280;">Ovaj email ste primili jer ste poslali upit putem web stranice Maximum Rent a Car.</td></tr>
    <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">${v.agencyAddress}</td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

function decisionHtmlEn(v: DecisionVars): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${v.title}</title>
<!--[if mso]>
<style type="text/css">
table {border-collapse:collapse;}
td {mso-line-height-rule:exactly;}
</style>
<![endif]-->
<style type="text/css">
@media only screen and (max-width:620px){
  .container{width:100% !important;}
  .px{padding-left:20px !important;padding-right:20px !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
<!-- Preheader -->
<span style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${v.preheader}</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;">

  <!-- Header -->
  <tr><td style="background-color:#E30613;padding:22px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;color:#ffffff;font-weight:bold;letter-spacing:2px;">MAXIMUM</td>
      <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#ffd6d9;letter-spacing:3px;">RENT A CAR</td>
    </tr>
    </table>
  </td></tr>

  <!-- Body card -->
  <tr><td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

    <!-- Title -->
    <tr><td style="padding:32px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#111111;font-weight:bold;">We received your inquiry</td></tr>
      <tr><td style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">${v.greeting}</td></tr>
      <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#111111;">${v.intro}</td></tr>
      </table>
    </td></tr>

    <!-- Important notice -->
    <tr><td style="padding:20px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-top:2px solid ${v.accent};">
      <tr><td style="padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6b7280;">${v.notice}</td></tr>
      </table>
    </td></tr>

    <!-- Summary -->
    <tr><td style="padding:24px 32px 0 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Inquiry no.</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#E30613;font-weight:bold;">${v.ref}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Vehicle</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;font-weight:bold;">${v.vehicle}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Pick-up</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.pickupLine}</td>
      </tr>
      <tr>
        <td width="170" style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:1px;color:#6b7280;text-transform:uppercase;vertical-align:top;">Drop-off</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#111111;">${v.dropoffLine}</td>
      </tr>
      </table>
    </td></tr>

    <!-- Agency contact -->
    <tr><td style="padding:28px 32px 32px 32px;" class="px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:2px;color:#6b7280;text-transform:uppercase;padding-bottom:8px;">Questions? Get in touch</td></tr>
      <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:24px;color:#111111;">
        Phone: <a href="tel:${telHref(v.agencyPhone)}" style="color:#E30613;text-decoration:underline;">${v.agencyPhone}</a><br>
        Email: <a href="mailto:${v.agencyEmail}" style="color:#E30613;text-decoration:underline;">${v.agencyEmail}</a>
      </td></tr>
      </table>
    </td></tr>

    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 32px 8px 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7280;">You are receiving this email because you submitted an inquiry on the Maximum Rent a Car website.</td></tr>
    <tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">${v.agencyAddress}</td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
`;
}

/** Same visual language as the inquiry emails; copy comes from lib/email.ts. */
export function decisionHtml(v: DecisionVars, locale: "HR" | "EN"): string {
  return locale === "EN" ? decisionHtmlEn(v) : decisionHtmlHr(v);
}
