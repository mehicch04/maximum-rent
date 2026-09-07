"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { REF_PREFIX, withUniqueReference } from "@/lib/reference";
import { rentalDays } from "@/lib/extras";

/**
 * Continuing a rental on a different vehicle.
 *
 * When a guest wants more days but their car is promised to somebody else, the
 * workable answer is usually a swap: they bring this one back as agreed and
 * leave in another. That is a second rental, not an edit of the first — the
 * two cars, and the two periods, have to stay separate in the records.
 */
export async function createContinuation(formData: FormData) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const sourceId = String(formData.get("sourceId") ?? "").trim();
  const carId = String(formData.get("carId") ?? "").trim();
  const until = String(formData.get("until") ?? "").trim();

  if (!sourceId || !carId || !until) redirect("/admin?msg=error");

  const source = await prisma.inquiry.findUnique({
    where: { id: sourceId },
    select: {
      firstName: true, lastName: true, email: true, phone: true,
      flightNumber: true, returnAt: true, reference: true,
      pickupLocationId: true, returnLocationId: true,
    },
  });
  if (!source) redirect("/admin?msg=error");

  // The continuation starts exactly where the current rental ends: the guest
  // hands one car over and takes the other in the same visit.
  const pickupAt = source.returnAt;
  const returnAt = new Date(until);

  if (Number.isNaN(returnAt.getTime()) || returnAt <= pickupAt) {
    redirect("/admin?msg=error");
  }

  // Checked again here. The list in the form was correct when it was drawn,
  // but somebody may have taken the car in the meantime.
  const [clashes, blocks] = await Promise.all([
    prisma.inquiry.count({
      where: {
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
  if (clashes + blocks > 0) redirect("/admin?msg=busy");

  const car = await prisma.car.findUnique({
    where: { id: carId },
    select: { title: true, pricePerDay: true },
  });

  const days = rentalDays(pickupAt, returnAt);
  const price = car?.pricePerDay != null ? Number(car.pricePerDay) * days : 0;

  await withUniqueReference(REF_PREFIX.inquiry, (reference) =>
    prisma.inquiry.create({
      data: {
        reference,
        carId,
        carTitleSnapshot: car?.title ?? null,
        // Picked up where the last one was dropped off, unless told otherwise.
        pickupLocationId: source.returnLocationId ?? source.pickupLocationId,
        returnLocationId: source.returnLocationId,
        pickupAt,
        returnAt,
        firstName: source.firstName,
        lastName: source.lastName,
        email: source.email,
        phone: source.phone,
        flightNumber: source.flightNumber,
        // Linked both ways: opening either reservation shows the other, so
        // nobody edits one half of a swap without seeing the rest of it.
        continuesFromId: sourceId,
        message: `Nastavak najma ${source.reference}, zamjena vozila.`,
        channel: "MANUAL",
        status: "CONFIRMED",
        locale: "HR",
        rentalDays: days,
        totalPrice: price,
      },
    }),
  );

  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  redirect("/admin?msg=continued");
}
