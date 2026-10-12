"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { busyCarsFor, getCarOccupancy } from "@/lib/extras-availability";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { sendReservationDecisionEmail } from "@/lib/email";

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
            status: { in: ["CONFIRMED", "IN_PROGRESS"] },
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

  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  backTo({ status, range, msg: outcome.msg });
}

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

  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  backTo({ status, range, msg: "cancelled" });
}

export async function addBlock(formData: FormData) {
  await requireAdmin();
  const carId = String(formData.get("carId") ?? "");
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);

  const KINDS = ["MAINTENANCE", "DAMAGE", "PRIVATE"] as const;
  const rawKind = String(formData.get("kind") ?? "MAINTENANCE");
  const kind = (KINDS as readonly string[]).includes(rawKind)
    ? (rawKind as (typeof KINDS)[number])
    : "MAINTENANCE";

  const startAt = new Date(`${from}T00:00:00.000Z`);
  const endAt = new Date(`${to}T00:00:00.000Z`);
  endAt.setUTCDate(endAt.getUTCDate() + 1);

  const valid =
    carId &&
    !Number.isNaN(startAt.getTime()) &&
    !Number.isNaN(endAt.getTime()) &&
    endAt.getTime() > startAt.getTime();

  if (!valid) backTo({ msg: "error" });

  const busy = busyCarsFor(
    await getCarOccupancy().catch(() => []),
    startAt,
    endAt,
  );
  if (busy.has(carId)) backTo({ msg: "error" });

  await prisma.carBlock.create({
    data: {
      carId,
      startAt,
      endAt,
      kind,
      reason: reason || null,
    },
  });

  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  backTo({ msg: "blocked" });
}

export async function removeBlock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.carBlock.deleteMany({ where: { id } });
  }
  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  backTo({ msg: "unblocked" });
}
