import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validations";
import { sendInquiryEmail, sendGuestConfirmationEmail } from "@/lib/email";
import { buildOwnerSummaryText } from "@/lib/whatsapp";
import { sendOwnerNotification } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
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
      },
    });

    const emailData = {
      ...d,
      reference: inquiry.reference,
      pickupLocationName: pickup?.name ?? null,
      returnLocationName: ret?.name ?? null,
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
      }),
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
