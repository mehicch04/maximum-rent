"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { availabilityFor, getBookedExtras, maxSelectable } from "@/lib/extras-availability";
import { extraLineTotal, rentalDays } from "@/lib/extras";

/**
 * Editing an existing reservation.
 *
 * Plans change after a booking is made: a guest calls to move the dates, swap
 * the car or add a seat. Without this the only options were cancelling and
 * starting over, which loses the reference number and sends the guest a
 * cancellation for something that was never actually cancelled.
 */

async function requireAdmin() {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function updateInquiry(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  if (!id) redirect("/admin?msg=error");

  const existing = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true, status: true, reference: true },
  });
  if (!existing) redirect("/admin?msg=error");

  const carId = str(formData, "carId") || null;
  const pickupAt = new Date(`${str(formData, "pickupDate")}T${str(formData, "pickupTime") || "10:00"}`);
  const returnAt = new Date(`${str(formData, "returnDate")}T${str(formData, "returnTime") || "10:00"}`);

  if (
    Number.isNaN(pickupAt.getTime()) ||
    Number.isNaN(returnAt.getTime()) ||
    returnAt <= pickupAt
  ) {
    redirect(`/admin?msg=error&edit=${id}`);
  }

  // The vehicle is only held once a reservation is confirmed, so the clash
  // check applies to confirmed ones. It must skip this very reservation —
  // otherwise a booking would always report a clash with itself.
  if (carId && existing.status === "CONFIRMED") {
    const [clashes, blocks] = await Promise.all([
      prisma.inquiry.count({
        where: {
          id: { not: id },
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
    if (clashes + blocks > 0) redirect(`/admin?msg=busy&edit=${id}`);
  }

  const days = rentalDays(pickupAt, returnAt);

  // Extras are re-checked the same way, ignoring what this reservation itself
  // is currently holding so its own pieces are not counted against it.
  let requested: { id: string; qty: number }[] = [];
  try {
    const parsed: unknown = JSON.parse(str(formData, "extras") || "[]");
    if (Array.isArray(parsed)) {
      requested = parsed
        .filter((r): r is { id: string; qty: number } =>
          !!r && typeof r.id === "string" && Number.isFinite(Number(r.qty)))
        .map((r) => ({ id: r.id, qty: Math.max(0, Math.floor(Number(r.qty))) }))
        .filter((r) => r.qty > 0);
    }
  } catch {
    requested = [];
  }

  let extraRows: {
    extraId: string;
    qty: number;
    nameHr: string;
    nameEn: string;
    pricing: "PER_DAY" | "PER_RENTAL" | "INCLUDED";
    unitPrice: number;
  }[] = [];

  if (requested.length > 0) {
    const [catalogue, bookedAll] = await Promise.all([
      prisma.extra.findMany({
        where: { id: { in: requested.map((r) => r.id) }, isActive: true },
        select: {
          id: true, nameHr: true, nameEn: true, pricing: true,
          price: true, maxQty: true, totalStock: true,
        },
      }),
      getBookedExtras().catch(() => []),
    ]);

    const ownExtras = await prisma.inquiryExtra.findMany({
      where: { inquiryId: id },
      select: { extraId: true, qty: true },
    });
    const ownQty = new Map<string, number>(
      ownExtras.map((o) => [o.extraId ?? "", o.qty] as [string, number]),
    );

    const free = availabilityFor(catalogue, bookedAll, pickupAt, returnAt);
    for (const [extraId, qty] of ownQty) {
      if (free[extraId] !== undefined) free[extraId] += qty;
    }

    for (const r of requested) {
      const item = catalogue.find((c) => c.id === r.id);
      if (!item) continue;
      if (r.qty > maxSelectable(item.maxQty, free[item.id] ?? 0)) {
        redirect(`/admin?msg=extras&edit=${id}`);
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

  // A price typed by hand wins: a discount agreed on the phone is a real
  // figure and the reports should carry it, not the list price.
  const manual = str(formData, "totalPrice").replace(",", ".");
  const totalPrice =
    manual !== "" && Number.isFinite(Number(manual))
      ? Number(manual)
      : rentalTotal + extrasTotal;

  await prisma.$transaction([
    prisma.inquiryExtra.deleteMany({ where: { inquiryId: id } }),
    prisma.inquiry.update({
      where: { id },
      data: {
        carId,
        carTitleSnapshot: car?.title ?? null,
        pickupLocationId: str(formData, "pickupLocationId") || null,
        returnLocationId: str(formData, "returnLocationId") || null,
        pickupAt,
        returnAt,
        firstName: str(formData, "firstName").slice(0, 60),
        lastName: str(formData, "lastName").slice(0, 60),
        email: str(formData, "email").slice(0, 120),
        phone: str(formData, "phone").slice(0, 30),
        flightNumber: str(formData, "flightNumber").slice(0, 20) || null,
        message: str(formData, "message").slice(0, 1000) || null,
        rentalDays: days,
        totalPrice,
        extras: extraRows.length ? { create: extraRows } : undefined,
      },
    }),
  ]);

  revalidateTag("fleet");
  revalidatePath("/admin");
  redirect("/admin?msg=updated");
}
