"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, tokenValid } from "@/lib/admin-auth";

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
