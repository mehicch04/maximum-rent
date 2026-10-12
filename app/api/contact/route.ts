import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tooManyRequests } from "@/lib/rate-limit";
import { contactRequestSchema } from "@/lib/validations";
import { sendContactEmail } from "@/lib/email";
import { sendOwnerNotification } from "@/lib/notify";
import { withUniqueReference, REF_PREFIX } from "@/lib/reference";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (await tooManyRequests(req, "msg", 5, 60 * 60 * 1000)) {
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

  const parsed = contactRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const d = parsed.data;

  try {
    const rec = await withUniqueReference(REF_PREFIX.message, (reference) =>
      prisma.contactRequest.create({
      data: {
        reference,
        type: d.type === "business" ? "BUSINESS" : "CONTACT",
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        company: d.company || null,
        message: d.message || null,
        locale: d.locale === "en" ? "EN" : "HR",
      },
      }),
    );

    const isBusiness = rec.type === "BUSINESS";

    await sendContactEmail({
      reference: rec.reference,
      type: isBusiness ? "BUSINESS" : "CONTACT",
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      company: d.company || null,
      message: d.message || null,
      locale: d.locale,
    });

    await sendOwnerNotification(
      `${isBusiness ? "🏢 Poslovni upit" : "✉️ Nova poruka"} (${rec.reference})\n` +
        `Od: ${d.firstName} ${d.lastName} · ${d.phone}\n` +
        `Email: ${d.email}` +
        (d.company ? `\nFirma: ${d.company}` : "") +
        (d.message ? `\nPoruka: ${d.message.slice(0, 300)}` : ""),
    );

    return NextResponse.json({ ok: true, reference: rec.reference });
  } catch (err) {
    console.error("[contact] create failed:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
