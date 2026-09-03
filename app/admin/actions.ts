"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  availabilityFor,
  busyCarsFor,
  getBookedExtras,
  getCarOccupancy,
  maxSelectable,
} from "@/lib/extras-availability";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { sendReservationDecisionEmail } from "@/lib/email";

// Defense in depth: middleware already guards /admin, but server actions are
// HTTP endpoints of their own — re-check the session cookie in each one.
async function requireAdmin() {
  const ok = await tokenValid(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

function filtersFrom(formData: FormData) {
  return {
    status: String(formData.get("statusFilter") ?? "pending"),
    range: String(formData.get("rangeFilter") ?? "all"),
  };
}

function backTo(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  redirect(`/admin${qs ? `?${qs}` : ""}`);
}

type DecisionEmailRow = {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  pickupAt: Date;
  returnAt: Date;
  locale: "HR" | "EN";
  carTitle: string | null;
};

function toDecisionRow(q: {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  pickupAt: Date;
  returnAt: Date;
  locale: string;
  carTitleSnapshot: string | null;
  car: { title: string } | null;
}): DecisionEmailRow {
  return {
    reference: q.reference,
    firstName: q.firstName,
    lastName: q.lastName,
    email: q.email,
    pickupAt: q.pickupAt,
    returnAt: q.returnAt,
    locale: q.locale === "EN" ? "EN" : "HR",
    carTitle: q.car?.title ?? q.carTitleSnapshot,
  };
}

/** PENDING/CONTACTED → CONFIRMED, with an overlap re-check inside a
 *  transaction so two admins can't double-book the same car. Sends the
 *  client a confirmation email afterwards (failures logged, never fatal). */
export async function confirmInquiry(formData: FormData) {
  await requireAdmin();
  const { status, range } = filtersFrom(formData);
  const id = String(formData.get("id") ?? "");
  if (!id) backTo({ status, range, msg: "error" });

  const outcome = await prisma.$transaction(async (tx) => {
    const inquiry = await tx.inquiry.findUnique({
      where: { id },
      include: { car: { select: { title: true } } },
    });
    if (!inquiry || inquiry.status === "CANCELLED") {
      return { msg: "error" as const, email: null };
    }
    // Idempotent re-click: already confirmed → no second email.
    if (inquiry.status === "CONFIRMED") {
      return { msg: "confirmed" as const, email: null };
    }

    if (inquiry.carId) {
      const [conflictsRes, conflictsBlk] = await Promise.all([
        tx.inquiry.count({
          where: {
            carId: inquiry.carId,
            status: "CONFIRMED",
            id: { not: inquiry.id },
            pickupAt: { lt: inquiry.returnAt },
            returnAt: { gt: inquiry.pickupAt },
          },
        }),
        tx.carBlock.count({
          where: {
            carId: inquiry.carId,
            startAt: { lt: inquiry.returnAt },
            endAt: { gt: inquiry.pickupAt },
          },
        }),
      ]);
      if (conflictsRes > 0 || conflictsBlk > 0) {
        return { msg: "conflict" as const, email: null };
      }
    }

    await tx.inquiry.update({
      where: { id: inquiry.id },
      data: { status: "CONFIRMED" },
    });
    return { msg: "confirmed" as const, email: toDecisionRow(inquiry) };
  });

  // Email after the transaction committed; never blocks the action.
  if (outcome.email) {
    try {
      await sendReservationDecisionEmail({
        inquiry: outcome.email,
        decision: "CONFIRMED",
      });
    } catch (err) {
      console.error("[admin] confirm email failed:", err);
    }
  }

  revalidatePath("/admin");
  backTo({ status, range, msg: outcome.msg });
}

/** → CANCELLED. Sends the client a "not confirmed" email when the status
 *  actually changed (no duplicate emails on re-click). */
export async function cancelInquiry(formData: FormData) {
  await requireAdmin();
  const { status, range } = filtersFrom(formData);
  const id = String(formData.get("id") ?? "");
  if (!id) backTo({ status, range, msg: "error" });

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { car: { select: { title: true } } },
  });
  if (!inquiry) backTo({ status, range, msg: "error" });

  const changed = inquiry!.status !== "CANCELLED";
  if (changed) {
    await prisma.inquiry.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    try {
      await sendReservationDecisionEmail({
        inquiry: toDecisionRow(inquiry!),
        decision: "CANCELLED",
      });
    } catch (err) {
      console.error("[admin] cancel email failed:", err);
    }
  }

  revalidatePath("/admin");
  backTo({ status, range, msg: "cancelled" });
}

/** Manual unavailability window (service etc.). Day-granularity, inclusive:
 *  [from 00:00 UTC, to+1d 00:00 UTC). */
export async function addBlock(formData: FormData) {
  await requireAdmin();
  const carId = String(formData.get("carId") ?? "");
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);

  const KINDS = ["MAINTENANCE", "MANUAL_BOOKING", "DAMAGE", "PRIVATE"] as const;
  const rawKind = String(formData.get("kind") ?? "MAINTENANCE");
  const kind = (KINDS as readonly string[]).includes(rawKind)
    ? (rawKind as (typeof KINDS)[number])
    : "MAINTENANCE";

  const clientName = String(formData.get("clientName") ?? "").trim().slice(0, 80);
  const rawPrice = String(formData.get("totalPrice") ?? "").replace(",", ".");
  const price = rawPrice === "" ? null : Number(rawPrice);

  const startAt = new Date(`${from}T00:00:00.000Z`);
  const endAt = new Date(`${to}T00:00:00.000Z`);
  endAt.setUTCDate(endAt.getUTCDate() + 1);

  // A manual booking without a name or a price would sit in the reports as an
  // anonymous zero, so it is rejected here as well as in the form: required
  // attributes in the browser can simply be bypassed.
  const bookingOk =
    kind !== "MANUAL_BOOKING" ||
    (clientName.length > 0 && price != null && Number.isFinite(price) && price >= 0);

  const valid =
    carId &&
    !Number.isNaN(startAt.getTime()) &&
    !Number.isNaN(endAt.getTime()) &&
    endAt.getTime() > startAt.getTime() &&
    bookingOk;

  if (!valid) backTo({ msg: "error" });

  // The greyed-out options in the browser are a convenience, not a guarantee:
  // the posted car id can be anything, so the clash is checked again here.
  const busy = busyCarsFor(
    await getCarOccupancy().catch(() => []),
    startAt,
    endAt,
  );
  if (busy.has(carId)) backTo({ msg: "error" });

  // Equipment, re-checked here. The browser sends only ids and quantities, and
  // that list can be tampered with, so availability is worked out again from
  // the database before anything is written.
  let extraRows: { extraId: string; qty: number; nameHr: string }[] = [];

  if (kind === "MANUAL_BOOKING") {
    let requested: { id: string; qty: number }[] = [];
    try {
      const parsed: unknown = JSON.parse(String(formData.get("extras") ?? "[]"));
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

    if (requested.length > 0) {
      const [catalogue, booked] = await Promise.all([
        prisma.extra.findMany({
          where: { id: { in: requested.map((r) => r.id) }, isActive: true },
          select: { id: true, nameHr: true, maxQty: true, totalStock: true },
        }),
        getBookedExtras(),
      ]);

      const free = availabilityFor(catalogue, booked, startAt, endAt);

      for (const r of requested) {
        const item = catalogue.find((c) => c.id === r.id);
        if (!item) continue;
        const cap = maxSelectable(item.maxQty, free[item.id] ?? 0);
        // Anything beyond what is genuinely free is refused outright rather
        // than quietly trimmed, so nobody leaves thinking it was booked.
        if (r.qty > cap) backTo({ msg: "error" });
        extraRows.push({ extraId: item.id, qty: r.qty, nameHr: item.nameHr });
      }
    }
  }

  await prisma.carBlock.create({
    data: {
      carId,
      startAt,
      endAt,
      kind,
      reason: reason || null,
      // Only kept where they mean something; a service block has no client.
      clientName: kind === "MANUAL_BOOKING" ? clientName : null,
      totalPrice: kind === "MANUAL_BOOKING" ? price : null,
      extras: extraRows.length ? { create: extraRows } : undefined,
    },
  });

  revalidatePath("/admin");
  backTo({ msg: "blocked" });
}

export async function removeBlock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.carBlock.deleteMany({ where: { id } });
  }
  revalidatePath("/admin");
  backTo({ msg: "unblocked" });
}
