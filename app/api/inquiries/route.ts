import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tooManyRequests } from "@/lib/rate-limit";
import { inquirySchema } from "@/lib/validations";
import { sendInquiryEmail, sendGuestConfirmationEmail } from "@/lib/email";
import { buildOwnerSummaryText } from "@/lib/whatsapp";
import { rentalDays, extraLineTotal } from "@/lib/extras";
import { withUniqueReference, REF_PREFIX } from "@/lib/reference";
import { sendOwnerNotification } from "@/lib/notify";
import { dailyRate, rentalTotal as rentalTotalFor } from "@/lib/pricing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // At most 8 submissions per hour from one address. A real guest never
  // needs more; a script does.
  if (await tooManyRequests(req, "inq", 8, 60 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "too_many_requests" },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const d = parsed.data;

  // Resolve relations defensively (ignore stale/unknown ids).
  const [car, pickup, ret] = await Promise.all([
    d.carId ? prisma.car.findUnique({ where: { id: d.carId } }) : null,
    d.pickupLocationId
      ? prisma.location.findUnique({ where: { id: d.pickupLocationId } })
      : null,
    d.returnLocationId
      ? prisma.location.findUnique({ where: { id: d.returnLocationId } })
      : null,
  ]);

  // Re-read the chosen extras from the database: the browser only sends ids
  // and quantities, so prices cannot be tampered with.
  const wanted = d.extras ?? [];
  const chosen = wanted.length
    ? await prisma.extra.findMany({
        where: { id: { in: wanted.map((e) => e.id) }, isActive: true },
      })
    : [];

  const days = rentalDays(new Date(d.pickupAt), new Date(d.returnAt));
  const extraRows = chosen.map((e) => {
    const qty = Math.min(
      Math.max(1, wanted.find((w) => w.id === e.id)?.qty ?? 1),
      e.maxQty,
    );
    return {
      extraId: e.id,
      nameHr: e.nameHr,
      nameEn: e.nameEn,
      pricing: e.pricing,
      unitPrice: e.price,
      qty,
    };
  });

  const extrasForEmail = extraRows.map((r) => ({
    nameHr: r.nameHr,
    nameEn: r.nameEn,
    pricing: r.pricing as "PER_DAY" | "PER_RENTAL" | "INCLUDED",
    qty: r.qty,
    unitPrice: Number(r.unitPrice),
    lineTotal: extraLineTotal(
      r.pricing as "PER_DAY" | "PER_RENTAL" | "INCLUDED",
      Number(r.unitPrice),
      r.qty,
      days,
    ),
  }));

  // Rental plus extras, locked in now. Reports read this figure, so it must
  // not shift when the owner edits prices later.
    // Seasonal rate included, so the stored figure matches what was quoted.
    const rentalTotal = await rentalTotalFor(car, days);
  const extrasTotal = extrasForEmail.reduce((a, e) => a + e.lineTotal, 0);
  const totalPrice = rentalTotal + extrasTotal;

  try {
    const inquiry = await withUniqueReference(REF_PREFIX.inquiry, (reference) =>
      prisma.inquiry.create({
      data: {
        reference,
        carId: car?.id ?? null,
        carTitleSnapshot: car?.title ?? d.carTitle,
        pickupLocationId: pickup?.id ?? null,
        returnLocationId: ret?.id ?? null,
        pickupAt: new Date(d.pickupAt),
        returnAt: new Date(d.returnAt),
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        flightNumber: d.flightNumber || null,
        message: d.message || null,
        channel: "EMAIL",
        locale: d.locale === "en" ? "EN" : "HR",
        totalPrice,
        rentalDays: days,
        extras: extraRows.length ? { create: extraRows } : undefined,
      },
      }),
    );

    const emailData = {
      ...d,
      reference: inquiry.reference,
      pickupLocationName: pickup?.name ?? null,
      returnLocationName: ret?.name ?? null,
      extras: extrasForEmail,
      days,
      pricePerDay: car ? await dailyRate(car) : null,
    };

    const email = await sendInquiryEmail(emailData);

    // Confirmation to the guest, in the language they browsed in.
    // Non-fatal — the inquiry is already stored either way.
    await sendGuestConfirmationEmail(emailData);

    // Automatic Telegram summary to the owner. Non-fatal — the inquiry
    // is already stored either way.
    await sendOwnerNotification(
      buildOwnerSummaryText({
        reference: inquiry.reference,
        createdAt: inquiry.createdAt,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        carTitle: car?.title ?? d.carTitle,
        pickupAt: new Date(d.pickupAt),
        returnAt: new Date(d.returnAt),
      }) +
        (extrasForEmail.length
          ? "\nDodatno: " +
            extrasForEmail
              .map((e) => `${e.nameHr}${e.qty > 1 ? ` x${e.qty}` : ""}`)
              .join(", ")
          : ""),
    );

    return NextResponse.json({
      ok: true,
      reference: inquiry.reference,
      emailSent: email.sent,
    });
  } catch (err) {
    console.error("[inquiries] create failed:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
