"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { DEPOSIT_STATUSES, FUEL_LEVELS } from "@/lib/rental-return";

/**
 * Handing the keys over.
 *
 * Records when it actually happened and moves the reservation to "in
 * progress". The agreed pickup time stays untouched: a guest who turns up two
 * hours late should not quietly rewrite what was booked, and the gap between
 * the two is worth being able to see later.
 */
export async function startRental(formData: FormData) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin?msg=error");

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!inquiry) redirect("/admin?msg=error");

  // Only a confirmed booking can be handed over. Anything else — already out,
  // cancelled, or never approved — is a mistake worth stopping rather than
  // silently accepting.
  if (inquiry.status !== "CONFIRMED") redirect("/admin?msg=notconfirmed");

  await prisma.inquiry.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      actualPickUpTime: new Date(),
    },
  });

  // The car stays occupied either way, but the lists that describe why it is
  // occupied have to be refreshed.
  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  redirect("/admin?msg=started");
}



/**
 * Closing a rental.
 *
 * Records when the car came back and in what state, then frees it. The freeing
 * is the part that matters operationally: a guest who brings the car back two
 * days early leaves two bookable days behind, and they are worth nothing if the
 * site only learns about them when the original period runs out.
 */
export async function finishRental(formData: FormData) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin?msg=error");

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true, status: true, pickupAt: true, actualPickUpTime: true },
  });
  if (!inquiry) redirect("/admin?msg=error");

  /**
   * A rental can be closed if the car is out, or if it should have gone out by
   * now and somebody forgot to press the button.
   *
   * Refusing the second case left the owner stuck: the guest is standing there
   * with the keys, the rental cannot be closed, and the only way forward is to
   * change the status by hand in a form they have no reason to open.
   */
  const startedOrDue =
    inquiry.status === "IN_PROGRESS" ||
    (inquiry.status === "CONFIRMED" && inquiry.pickupAt <= new Date());

  if (!startedOrDue) redirect("/admin?msg=notactive");

  const pick = <T extends readonly string[]>(raw: string, allowed: T) =>
    (allowed as readonly string[]).includes(raw) ? raw : null;

  const returnFuel = pick(
    String(formData.get("returnFuel") ?? ""),
    FUEL_LEVELS,
  );
  const depositStatus = pick(
    String(formData.get("depositStatus") ?? ""),
    DEPOSIT_STATUSES.map((d) => d.value),
  );

  const rawCharge = String(formData.get("extraCharge") ?? "").replace(",", ".");
  const parsed = rawCharge === "" ? null : Number(rawCharge);
  const extraCharge =
    parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;

  const note = String(formData.get("extraChargeNote") ?? "").trim().slice(0, 200);

  // A charge with no explanation is the one thing that always gets questioned
  // later, so it is refused rather than saved half-finished.
  if (extraCharge != null && extraCharge > 0 && note === "") {
    redirect(`/admin?msg=chargenote&filter=active`);
  }

  await prisma.inquiry.update({
    where: { id },
    data: {
      status: "COMPLETED",
      actualDropOffTime: new Date(),
      // Left alone if handover was recorded. When it was skipped, the agreed
      // hour is the closest honest guess; inventing a time would be worse.
      actualPickUpTime: inquiry.actualPickUpTime ?? inquiry.pickupAt,
      returnFuel,
      depositStatus,
      extraCharge,
      extraChargeNote: extraCharge != null && extraCharge > 0 ? note || null : null,
    },
  });

  // The car and its equipment are free from this moment, so the cached public
  // lists have to be dropped straight away.
  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  redirect("/admin?msg=finished&filter=active");
}
