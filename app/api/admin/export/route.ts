import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import {
  exportFilename,
  fmtBool,
  fmtDate,
  fmtDateTime,
  fmtNumber,
  toCsv,
} from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

/** Parses a yyyy-mm-dd query value; returns null when absent or malformed. */
function parseDate(v: string | null, endOfDay = false): Date | null {
  if (!v) return null;
  const d = new Date(`${v}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "rezervacije";
  const from = parseDate(url.searchParams.get("from"));
  const to = parseDate(url.searchParams.get("to"), true);
  const status = url.searchParams.get("status") ?? "";

  // The date range filters on when the record was created.
  const createdAt =
    from || to
      ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {};

  let headers: string[] = [];
  let rows: unknown[][] = [];
  let kind = type;

  try {
    if (type === "vozila") {
      const cars = await prisma.car.findMany({
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      });
      headers = [
        "Naziv", "Marka", "Model", "Godište", "Klasa", "Mjenjač", "Gorivo",
        "Putnika", "Vrata", "Prtljag", "Klima", "Cijena po danu", "Valuta",
        "Depozit", "Dostupno", "Izdvojeno", "Redoslijed", "Broj fotografija",
      ];
      rows = cars.map((c) => [
        c.title, c.brand, c.model, c.year, c.carClass, c.transmission,
        c.fuelType, c.passengers, c.doors, c.luggage ?? "", fmtBool(c.airCondition),
        fmtNumber(c.pricePerDay), c.currency, fmtNumber(c.deposit),
        fmtBool(c.isAvailable), fmtBool(c.isFeatured), c.sortOrder,
        c.images?.length ?? 0,
      ]);
    } else if (type === "poruke") {
      const msgs = await prisma.contactRequest.findMany({
        where: { ...createdAt },
        orderBy: { createdAt: "desc" },
      });
      headers = [
        "Broj", "Tip", "Status", "Zaprimljeno", "Ime", "Prezime", "Firma",
        "Email", "Telefon", "Jezik", "Poruka",
      ];
      rows = msgs.map((m) => [
        m.reference,
        m.type === "BUSINESS" ? "Poslovna ponuda" : "Kontakt",
        m.status === "DONE" ? "Riješeno" : "Novo",
        fmtDateTime(m.createdAt),
        m.firstName, m.lastName, m.company ?? "", m.email, m.phone,
        m.locale, m.message ?? "",
      ]);
    } else {
      kind = "rezervacije";
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
      headers = [
        "Broj upita", "Status", "Zaprimljeno", "Vozilo", "Preuzimanje",
        "Vraćanje", "Broj dana", "Lokacija preuzimanja", "Lokacija vraćanja",
        "Ime", "Prezime", "Email", "Telefon", "Broj leta", "Jezik",
        "Dodatna oprema", "Napomena",
      ];
      rows = inquiries.map((q) => {
        const days = Math.max(
          1,
          Math.ceil(
            (q.returnAt.getTime() - q.pickupAt.getTime()) / 86_400_000,
          ),
        );
        const extras = q.extras
          .map(
            (e) =>
              `${e.nameHr}${e.qty > 1 ? ` x${e.qty}` : ""}` +
              ` (${PRICING[e.pricing] ?? e.pricing})`,
          )
          .join(", ");
        return [
          q.reference,
          STATUS[q.status] ?? q.status,
          fmtDateTime(q.createdAt),
          q.car?.title ?? q.carTitleSnapshot ?? "",
          fmtDateTime(q.pickupAt),
          fmtDateTime(q.returnAt),
          days,
          q.pickupLocation?.name ?? "",
          q.returnLocation?.name ?? "",
          q.firstName, q.lastName, q.email, q.phone,
          q.flightNumber ?? "",
          q.locale,
          extras,
          q.message ?? "",
        ];
      });
    }
  } catch (err) {
    console.error("[export] failed:", err);
    return NextResponse.json({ ok: false, error: "export_failed" }, { status: 500 });
  }

  const csv = toCsv(headers, rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename(kind)}"`,
      "Cache-Control": "no-store",
    },
  });
}
