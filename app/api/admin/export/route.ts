import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import {
  buildWorkbook,
  safeText,
  workbookFilename,
  type Column,
} from "@/lib/xlsx-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const STATUS: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Kontaktiran",
  CONFIRMED: "Potvrđeno",
  CANCELLED: "Otkazano",
  COMPLETED: "Završeno",
};

const PRICING: Record<string, string> = {
  PER_DAY: "po danu",
  PER_RENTAL: "po najmu",
  INCLUDED: "uključeno",
};

function parseDate(v: string | null, endOfDay = false): Date | null {
  if (!v) return null;
  const d = new Date(`${v}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export async function GET(req: Request) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "rezervacije";
  const from = parseDate(url.searchParams.get("from"));
  const to = parseDate(url.searchParams.get("to"), true);
  const status = url.searchParams.get("status") ?? "";

  const createdAt =
    from || to
      ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {};

  let columns: Column[] = [];
  let rows: unknown[][] = [];
  let kind = type;
  let sheet = "Podaci";

  try {
    if (type === "vozila") {
      sheet = "Vozila";
      const cars = await prisma.car.findMany({
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      });
      columns = [
        { header: "Naziv" },
        { header: "Marka" },
        { header: "Model" },
        { header: "Godište", kind: "number" },
        { header: "Klasa" },
        { header: "Mjenjač" },
        { header: "Gorivo" },
        { header: "Putnika", kind: "number" },
        { header: "Vrata", kind: "number" },
        { header: "Prtljag", kind: "number" },
        { header: "Klima" },
        { header: "Cijena / dan", kind: "money" },
        { header: "Valuta" },
        { header: "Depozit", kind: "money" },
        { header: "Dostupno" },
        { header: "Izdvojeno" },
        { header: "Redoslijed", kind: "number" },
        { header: "Fotografija", kind: "number" },
      ];
      rows = cars.map((c) => [
        safeText(c.title), safeText(c.brand), safeText(c.model), c.year,
        c.carClass, c.transmission, c.fuelType, c.passengers, c.doors,
        c.luggage ?? null, c.airCondition ? "da" : "ne",
        num(c.pricePerDay), c.currency, num(c.deposit),
        c.isAvailable ? "da" : "ne", c.isFeatured ? "da" : "ne",
        c.sortOrder, c.images?.length ?? 0,
      ]);
    } else if (type === "poruke") {
      sheet = "Poruke";
      const msgs = await prisma.contactRequest.findMany({
        where: { ...createdAt },
        orderBy: { createdAt: "desc" },
      });
      columns = [
        { header: "Broj" },
        { header: "Tip" },
        { header: "Status" },
        { header: "Zaprimljeno", kind: "datetime" },
        { header: "Ime" },
        { header: "Prezime" },
        { header: "Firma" },
        { header: "Email" },
        { header: "Telefon" },
        { header: "Jezik" },
        { header: "Poruka", width: 46 },
      ];
      rows = msgs.map((m) => [
        m.reference,
        m.type === "BUSINESS" ? "Poslovna ponuda" : "Kontakt",
        m.status === "DONE" ? "Riješeno" : "Novo",
        m.createdAt,
        safeText(m.firstName), safeText(m.lastName), safeText(m.company),
        safeText(m.email), safeText(m.phone), m.locale, safeText(m.message),
      ]);
    } else {
      kind = "rezervacije";
      sheet = "Rezervacije";
      const inquiries = await prisma.inquiry.findMany({
        where: { ...createdAt, ...(status ? { status: status as never } : {}) },
        orderBy: { createdAt: "desc" },
        include: {
          car: { select: { title: true } },
          pickupLocation: { select: { name: true } },
          returnLocation: { select: { name: true } },
          extras: true,
        },
      });
      columns = [
        { header: "Broj upita" },
        { header: "Status" },
        { header: "Zaprimljeno", kind: "datetime" },
        { header: "Vozilo" },
        { header: "Preuzimanje", kind: "datetime" },
        { header: "Vraćanje", kind: "datetime" },
        { header: "Dana", kind: "number" },
        { header: "Ukupna cijena", kind: "money" },
        { header: "Lokacija preuzimanja" },
        { header: "Lokacija vraćanja" },
        { header: "Ime" },
        { header: "Prezime" },
        { header: "Email" },
        { header: "Telefon" },
        { header: "Broj leta" },
        { header: "Jezik" },
        { header: "Dodatna oprema", width: 38 },
        { header: "Napomena", width: 46 },
      ];
      rows = inquiries.map((q) => {
        const days = Math.max(
          1,
          Math.ceil((q.returnAt.getTime() - q.pickupAt.getTime()) / 86_400_000),
        );
        const extras = q.extras
          .map(
            (e) =>
              `${e.nameHr}${e.qty > 1 ? ` x${e.qty}` : ""} (${PRICING[e.pricing] ?? e.pricing})`,
          )
          .join(", ");
        return [
          q.reference,
          STATUS[q.status] ?? q.status,
          q.createdAt,
          safeText(q.car?.title ?? q.carTitleSnapshot ?? ""),
          q.pickupAt,
          q.returnAt,
          days,
          q.totalPrice != null ? Number(q.totalPrice) : null,
          safeText(q.pickupLocation?.name ?? ""),
          safeText(q.returnLocation?.name ?? ""),
          safeText(q.firstName), safeText(q.lastName),
          safeText(q.email), safeText(q.phone),
          safeText(q.flightNumber), q.locale,
          safeText(extras), safeText(q.message),
        ];
      });
    }
  } catch (err) {
    console.error("[export] failed:", err);
    return NextResponse.json({ ok: false, error: "export_failed" }, { status: 500 });
  }

  const buf = await buildWorkbook(sheet, columns, rows);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${workbookFilename(kind)}"`,
      "Cache-Control": "no-store",
    },
  });
}
