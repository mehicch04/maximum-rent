"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { REF_PREFIX, withUniqueReference } from "@/lib/reference";
import { extraLineTotal, rentalDays } from "@/lib/extras";
import {
  availabilityFor,
  getBookedExtras,
  maxSelectable,
} from "@/lib/extras-availability";

/**
 * A booking agreed by phone or at the desk.
 *
 * Stored as an ordinary reservation rather than a block, so it gets its own
 * reference, sits in the same list as bookings from the website, counts in the
 * reports and can be edited with the same form. Recording it any other way
 * would mean maintaining two half-versions of the same thing.
 */

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function createManualInquiry(formData: FormData) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const carId = str(formData, "carId") || null;
  const pickupAt = new Date(
    `${str(formData, "pickupDate")}T${str(formData, "pickupTime") || "10:00"}`,
  );
  const returnAt = new Date(
    `${str(formData, "returnDate")}T${str(formData, "returnTime") || "10:00"}`,
  );

  const firstName = str(formData, "firstName").slice(0, 60);
  const lastName = str(formData, "lastName").slice(0, 60);

  if (
    !firstName ||
    Number.isNaN(pickupAt.getTime()) ||
    Number.isNaN(returnAt.getTime()) ||
    returnAt <= pickupAt
  ) {
    redirect("/admin?msg=error");
  }

  // The vehicle is held the moment this is saved, so the clash check runs
  // against confirmed reservations and blocks alike.
  if (carId) {
    const [clashes, blocks] = await Promise.all([
      prisma.inquiry.count({
        where: {
          carId,
          status: "CONFIRMED",
          pickupAt: { lt: returnAt },
          returnAt: { gt: pickupAt },
        },
      }),
      prisma.carBlock.count({
        where: { carId, startAt: { lt: returnAt }, endAt: { gt: pickupAt } },
      }),
    ]);
    if (clashes + blocks > 0) redirect("/admin?msg=busy");
  }

  const days = rentalDays(pickupAt, returnAt);

  // Equipment is re-checked here; the list posted by the browser is only a
  // request, never a reservation in itself.
  let requested: { id: string; qty: number }[] = [];
  try {
    const parsed: unknown = JSON.parse(str(formData, "extras") || "[]");
    if (Array.isArray(parsed)) {
      requested = parsed
        .filter(
          (r): r is { id: string; qty: number } =>
            !!r && typeof r.id === "string" && Number.isFinite(Number(r.qty)),
        )
        .map((r) => ({ id: r.id, qty: Math.max(0, Math.floor(Number(r.qty))) }))
        .filter((r) => r.qty > 0);
    }
  } catch {
    requested = [];
  }

  const extraRows: {
    extraId: string;
    qty: number;
    nameHr: string;
    nameEn: string;
    pricing: "PER_DAY" | "PER_RENTAL" | "INCLUDED";
    unitPrice: number;
  }[] = [];

  if (requested.length > 0) {
    const [catalogue, booked] = await Promise.all([
      prisma.extra.findMany({
        where: { id: { in: requested.map((r) => r.id) }, isActive: true },
        select: {
          id: true, nameHr: true, nameEn: true,
          pricing: true, price: true, maxQty: true, totalStock: true,
        },
      }),
      getBookedExtras().catch(() => []),
    ]);

    const free = availabilityFor(catalogue, booked, pickupAt, returnAt);

    for (const r of requested) {
      const item = catalogue.find((c) => c.id === r.id);
      if (!item) continue;
      if (r.qty > maxSelectable(item.maxQty, free[item.id] ?? 0)) {
        redirect("/admin?msg=extras");
      }
      extraRows.push({
        extraId: item.id,
        qty: r.qty,
        nameHr: item.nameHr,
        nameEn: item.nameEn,
        pricing: item.pricing,
        unitPrice: Number(item.price),
      });
    }
  }

  const car = carId
    ? await prisma.car.findUnique({
        where: { id: carId },
        select: { title: true, pricePerDay: true },
      })
    : null;

  const rentalTotal = car?.pricePerDay != null ? Number(car.pricePerDay) * days : 0;
  const extrasTotal = extraRows.reduce(
    (a, e) => a + extraLineTotal(e.pricing, e.unitPrice, e.qty, days),
    0,
  );

  // A price typed by hand wins: a discount given at the desk is the real
  // figure, and the reports should carry what was actually agreed.
  const typed = str(formData, "totalPrice").replace(",", ".");
  const totalPrice =
    typed !== "" && Number.isFinite(Number(typed))
      ? Number(typed)
      : rentalTotal + extrasTotal;

  await withUniqueReference(REF_PREFIX.inquiry, (reference) =>
    prisma.inquiry.create({
      data: {
        reference,
        carId,
        carTitleSnapshot: car?.title ?? null,
        pickupLocationId: str(formData, "pickupLocationId") || null,
        returnLocationId: str(formData, "returnLocationId") || null,
        pickupAt,
        returnAt,
        firstName,
        lastName,
        email: str(formData, "email").slice(0, 120),
        phone: str(formData, "phone").slice(0, 30),
        flightNumber: str(formData, "flightNumber").slice(0, 20) || null,
        message: str(formData, "message").slice(0, 1000) || null,
        channel: "MANUAL",
        // Agreed in person, so it is confirmed from the start; nobody needs to
        // approve a booking they just took themselves.
        status: "CONFIRMED",
        locale: "HR",
        rentalDays: days,
        totalPrice,
        extras: extraRows.length ? { create: extraRows } : undefined,
      },
    }),
  );

  revalidateTag("fleet");
  revalidatePath("/admin");
  redirect("/admin?msg=created");
}
