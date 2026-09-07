"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { REF_PREFIX, withUniqueReference } from "@/lib/reference";
import { rentalDays } from "@/lib/extras";

/**
 * One-off move of phone bookings out of the blocks table.
 *
 * They were originally recorded as blocks, before manual reservations had a
 * screen of their own. That left revenue in two places: the reports read both,
 * the Excel export read only one, and the two totals disagreed. After this the
 * reservations table is the single record of what was earned.
 *
 * Safe to run more than once: once a block is converted it is deleted, so a
 * second run simply finds nothing left to do.
 */

type MigrationResult = {
  moved: number;
  extras: number;
  skipped: number;
  errors: string[];
};

/** "Ana Marić" into the two fields a reservation expects. */
function splitName(full: string | null): { firstName: string; lastName: string } {
  const parts = String(full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Nepoznat", lastName: "klijent" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function migrateOldManualBlocks(): Promise<void> {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const result: MigrationResult = { moved: 0, extras: 0, skipped: 0, errors: [] };

  const blocks = await prisma.carBlock.findMany({
    where: { kind: "MANUAL_BOOKING" },
    include: { extras: true },
    orderBy: { createdAt: "asc" },
  });

  for (const block of blocks) {
    try {
      // Equipment needs a price and an English name, which the block never
      // stored. They are read from the catalogue; an item deleted since keeps
      // its recorded name and moves across at zero, rather than being dropped.
      const ids = block.extras.map((e) => e.extraId).filter(Boolean) as string[];
      const catalogue = ids.length
        ? await prisma.extra.findMany({
            where: { id: { in: ids } },
            select: { id: true, nameHr: true, nameEn: true, pricing: true, price: true },
          })
        : [];

      const extraRows = block.extras.map((e) => {
        const c = catalogue.find((x) => x.id === e.extraId);
        return {
          extraId: e.extraId,
          qty: e.qty,
          nameHr: c?.nameHr ?? e.nameHr,
          nameEn: c?.nameEn ?? e.nameHr,
          pricing: c?.pricing ?? ("PER_RENTAL" as const),
          unitPrice: c ? Number(c.price) : 0,
        };
      });

      const car = block.carId
        ? await prisma.car.findUnique({
            where: { id: block.carId },
            select: { title: true },
          })
        : null;

      const { firstName, lastName } = splitName(block.clientName);

      // Creating the reservation and removing the block go together: a failure
      // half way would either duplicate the income or lose it.
      await prisma.$transaction(async (tx) => {
        await withUniqueReference(REF_PREFIX.inquiry, (reference) =>
          tx.inquiry.create({
            data: {
              reference,
              carId: block.carId,
              carTitleSnapshot: car?.title ?? null,
              pickupAt: block.startAt,
              returnAt: block.endAt,
              firstName,
              lastName,
              // The block never held these; empty is honest, a made-up address
              // would not be.
              email: "",
              phone: "",
              flightNumber: null,
              message: block.reason ?? null,
              channel: "MANUAL",
              status: "CONFIRMED",
              locale: "HR",
              rentalDays: rentalDays(block.startAt, block.endAt),
              totalPrice: block.totalPrice,
              // The original date is kept, so reports for past months do not
              // suddenly gain income they never had.
              createdAt: block.createdAt,
              extras: extraRows.length ? { create: extraRows } : undefined,
            },
          }),
        );

        await tx.carBlock.delete({ where: { id: block.id } });
      });

      result.moved += 1;
      result.extras += extraRows.length;
    } catch (err) {
      result.skipped += 1;
      result.errors.push(
        `${block.id}: ${err instanceof Error ? err.message : "nepoznata greška"}`,
      );
      console.error("[migracija] blokada nije prebačena:", block.id, err);
    }
  }

  console.log("[migracija] rezultat:", result);

  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  redirect(
    `/admin?msg=migrated&moved=${result.moved}&skipped=${result.skipped}`,
  );
}
