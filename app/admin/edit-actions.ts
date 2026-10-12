"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { availabilityFor, getBookedExtras, maxSelectable } from "@/lib/extras-availability";
import { extraLineTotal, rentalDays } from "@/lib/extras";
import { rentalTotal } from "@/lib/pricing";

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

  const STATUSES = [
    "NEW",
    "CONTACTED",
    "CONFIRMED",
    "IN_PROGRESS",
    "CANCELLED",
    "COMPLETED",
  ] as const;
  const rawStatus = str(formData, "status");
  const status = (STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as (typeof STATUSES)[number])
    : existing.status;

  const restoring = existing.status === "CANCELLED" && status === "CONFIRMED";
  const statusNote = str(formData, "statusNote").slice(0, 300);
  if (restoring && !statusNote) redirect(`/admin?msg=reason&edit=${id}`);

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

  if (carId && (status === "CONFIRMED" || status === "IN_PROGRESS")) {
    const [clashes, blocks] = await Promise.all([
      prisma.inquiry.count({
        where: {
          id: { not: id },
          carId,
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
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
        select: { title: true, pricePerDay: true, seasonalPrice: true },
      })
    : null;

  const rental = await rentalTotal(car, days);
  const extrasTotal = extraRows.reduce(
    (a, e) => a + extraLineTotal(e.pricing, e.unitPrice, e.qty, days),
    0,
  );

  const manual = str(formData, "totalPrice").replace(",", ".");
  const totalPrice =
    manual !== "" && Number.isFinite(Number(manual))
      ? Number(manual)
      : rental + extrasTotal;

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
        status,
        ...(restoring ? { statusNote } : {}),
        rentalDays: days,
        totalPrice,
        extras: extraRows.length ? { create: extraRows } : undefined,
      },
    }),
  ]);

  revalidateTag("fleet");
  // Equipment moves with the reservation, so its list has to drop too.
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  redirect("/admin?msg=updated");
}
