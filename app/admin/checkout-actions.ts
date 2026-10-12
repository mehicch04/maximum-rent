"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";
import { DEPOSIT_STATUSES, FUEL_LEVELS } from "@/lib/rental-return";

export async function startRental(formData: FormData) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin?msg=error");

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true, status: true, carId: true },
  });

  if (!inquiry) redirect("/admin?msg=error");

  if (inquiry.status !== "CONFIRMED") redirect("/admin?msg=notconfirmed");

  if (!inquiry.carId) redirect("/admin?msg=nocar");

  await prisma.inquiry.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      actualPickUpTime: new Date(),
    },
  });

  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  redirect("/admin?msg=started");
}



export async function finishRental(formData: FormData) {
  if (!(await tokenValid(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin?msg=error");

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      carId: true,
      pickupAt: true,
      actualPickUpTime: true,
    },
  });
  if (!inquiry) redirect("/admin?msg=error");

  const startedOrDue =
    inquiry.status === "IN_PROGRESS" ||
    (inquiry.status === "CONFIRMED" && inquiry.pickupAt <= new Date());

  if (!startedOrDue) redirect("/admin?msg=notactive");

  if (!inquiry.carId) redirect("/admin?msg=nocar");

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

  if (extraCharge != null && extraCharge > 0 && note === "") {
    redirect(`/admin?msg=chargenote&filter=active`);
  }

  await prisma.inquiry.update({
    where: { id },
    data: {
      status: "COMPLETED",
      actualDropOffTime: new Date(),
      actualPickUpTime: inquiry.actualPickUpTime ?? inquiry.pickupAt,
      returnFuel,
      depositStatus,
      extraCharge,
      extraChargeNote: extraCharge != null && extraCharge > 0 ? note || null : null,
    },
  });

  revalidateTag("fleet");
  revalidateTag("extras");
  revalidatePath("/admin", "layout");
  redirect("/admin?msg=finished&filter=active");
}
